import { inject, Injectable } from '@angular/core';
import {
  catchError,
  defer,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  DataToDecrypt,
  DataToEncrypt,
  EncryptedCredentials,
  ExtractedCredentials,
  RawCredentials,
} from '../interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PasswordManager {
  private _textEncoder = new TextEncoder();
  private _textDecoder = new TextDecoder();

  private _masterKey: Uint8Array | null = null;
  private _router: Router;

  constructor() {
    this._router = inject(Router);
  }

  public setMasterKey(key: Uint8Array) {
    this._masterKey = key;
  }

  private getMasterKey() {
    if (!this._masterKey) {
      // If the master key is not set, navigate to the login page
      // and throw an error to prevent further execution.
      this._router.navigate(['login']);
      throw new Error('Master key is not set');
    }
    return new Uint8Array([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
      0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    ]);
  }

  private randBytes(len: number): Uint8Array {
    const b = new Uint8Array(len);
    crypto.getRandomValues(b);
    return b;
  }

  private composePayloadU8(username: string, password: string): Uint8Array {
    const json = JSON.stringify({ username, password });
    return this._textEncoder.encode(json);
  }

  private parsePayloadU8(u8: Uint8Array): DataToEncrypt {
    const s = this._textDecoder.decode(u8);
    return JSON.parse(s) as DataToEncrypt;
  }

  private generateCryptoKey() {
    return defer(() =>
      from(
        crypto.subtle.importKey(
          'raw',
          this.getMasterKey().buffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        )
      )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private toArrayBuffer(u8: Uint8Array): ArrayBuffer {
    return u8.buffer.slice(
      u8.byteOffset,
      u8.byteOffset + u8.byteLength
    ) as ArrayBuffer;
  }

  /**
   * Encrypts the provided raw credentials using AES-GCM encryption.
   *
   * This method takes raw credentials (username, password, and optionally a domain)
   * and encrypts them into a secure format. It uses AES-GCM for encryption, which
   * provides both confidentiality and integrity. The encryption process includes
   * generating a random initialization vector (IV) and optionally using the domain
   * as additional authenticated data (AAD).
   *
   * @param data - The raw credentials to be encrypted, including `userName`, `password`,
   *               and optionally `domain`.
   * @returns An `Observable` that emits the encrypted credentials, which include the
   *          initialization vector (`iv`) and the ciphertext.
   */
  public encryptCredentials(
    data: RawCredentials
  ): Observable<EncryptedCredentials> {
    const { userName, password, domain } = data;

    const plaintext = this.composePayloadU8(userName, password);
    const iv = this.randBytes(12); // 96-bit recommended for AES-GCM
    const aad = domain ? this._textEncoder.encode(domain) : undefined;

    return this.generateCryptoKey().pipe(
      switchMap((cryptoKey) =>
        from(
          crypto.subtle.encrypt(
            {
              name: 'AES-GCM',
              iv: this.toArrayBuffer(iv),
              ...(aad && { additionalData: this.toArrayBuffer(aad) }),
              tagLength: 128,
            },
            cryptoKey,
            this.toArrayBuffer(plaintext)
          )
        ).pipe(
          map(
            (ctBuf: ArrayBuffer) =>
              ({
                iv,
                ciphertext: new Uint8Array(ctBuf),
              } as EncryptedCredentials)
          )
        )
      )
    );
  }

  /**
   * Decrypts encrypted credentials using AES-GCM.
   *
   * @param data - The data to decrypt, which includes:
   *   - `iv`: The initialization vector used during encryption.
   *   - `ciphertext`: The encrypted data to be decrypted.
   *   - `domain`: (Optional) The domain used as additional authenticated data (AAD).
   * @returns An `Observable` that emits the decrypted credentials as `ExtractedCredentials`.
   *
   * @throws An error if decryption fails.
   *
   * @remarks
   * This function uses the Web Crypto API's `subtle.decrypt` method to perform decryption.
   * The `domain` parameter, if provided, is encoded as additional authenticated data (AAD)
   * to ensure integrity during decryption.
   */
  decryptCredentials(data: DataToDecrypt): Observable<ExtractedCredentials> {
    const { iv, ciphertext, domain } = data;
    const aad = domain ? this._textEncoder.encode(domain) : undefined;

    return this.generateCryptoKey().pipe(
      switchMap((cryptoKey) =>
        from(
          crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: this.toArrayBuffer(iv),
              ...(aad && { additionalData: this.toArrayBuffer(aad) }),
              tagLength: 128,
            },
            cryptoKey,
            this.toArrayBuffer(ciphertext)
          )
        ).pipe(
          map((ptBuf: ArrayBuffer) =>
            this.parsePayloadU8(new Uint8Array(ptBuf))
          ),
          catchError(() => {
            throw new Error('Decryption failed');
          })
        )
      )
    );
  }
}
