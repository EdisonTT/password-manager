import { inject, Injectable } from '@angular/core';
import { DbHandler } from './db-handler.service';
import {
  catchError,
  defer,
  finalize,
  from,
  map,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { KDFParams, VaultMetadata } from '../interface';
import { KDF_CONFIG } from '../const';
import { PasswordManager } from './password-manager.service';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private _dbHandler: DbHandler;
  private _passwordManager: PasswordManager;

  constructor() {
    this._dbHandler = inject(DbHandler);
    this._passwordManager = inject(PasswordManager);
  }

  private createSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  private createIv(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  public createVault(name: string, password: string): Observable<boolean> {
    return this._dbHandler.clearAll().pipe(
      switchMap(() => {
        const salt = this.createSalt();
        const iv = this.createIv();
        const vaultMetaData: VaultMetadata = {
          kind: 'vault-metadata',
          createdAt: new Date().toISOString(),
          kdf: 'Argon2id',
          version: 1,
          userName: name,
          kdfParams: {
            salt,
            ...KDF_CONFIG,
          },
          test: {
            iv,
            ciphertext: new Uint8Array([]),
          },
        };
        return this.derivekey(password, vaultMetaData.kdfParams).pipe(
          switchMap(({ key, kdf }) => {
            vaultMetaData.kdf = kdf;
            this._passwordManager.setMasterKey(key);
            return this._dbHandler
              .storeVaultMetadata(vaultMetaData)
              .pipe(map(() => true));
          })
        );
      })
    );
  }

  private derivekey(
    password: string,
    config: KDFParams
  ): Observable<{
    key: Uint8Array;
    kdf: 'Argon2id' | 'pbkdf2';
  }> {
    return defer(() => {
      if (!password)
        throwError(() => new Error('No password available for key derivation'));
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const maybeArgon2 = (window as any).argon2;
      if (maybeArgon2 && typeof maybeArgon2.hash === 'function')
        return this.argon2id(config, passwordBytes).pipe(
          map((key) => ({ key, kdf: 'Argon2id' as const }))
        );
      // Fallback to PBKDF2 if Argon2id is unavailable
      return this.PBKDF2(config, passwordBytes).pipe(
        map((key) => ({ key, kdf: 'pbkdf2' as const }))
      );
    });
  }

  private argon2id(
    config: KDFParams,
    passwordBytes: Uint8Array
  ): Observable<Uint8Array> {
    const argon = (window as any).argon2;
    const argonOpts = {
      pass: passwordBytes,
      salt: config.salt,
      time: config.time,
      mem: config.memory,
      parallelism: config.parallelism,
      hashLen: config.hashLen,
      type: argon.ArgonType ? argon.ArgonType.Argon2id : undefined,
      raw: true,
    };
    return from(argon.hash(argonOpts)).pipe(
      map((res: any) => {
        // Many argon2-browser variants return { hash: Uint8Array } when raw:true
        // Others may return an ArrayBuffer or hex string; try Putto handle common cases.
        passwordBytes.fill(0);
        if (res && res.hash instanceof Uint8Array) return res.hash;
        if (res && res.hash && typeof res.hash === 'object' && res.hash.buffer)
          return new Uint8Array(res.hash.buffer);
        if (res && res.raw instanceof Uint8Array) return res.raw;
        if (res && (res.hashHex || typeof res.hash === 'string')) {
          const hex = (res.hashHex ?? res.hash) as string;
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
          }
          return bytes;
        }
        throw new Error('Unexpected Argon2 result format');
      })
    );
  }

  private PBKDF2(config: KDFParams, passwordBytes: Uint8Array) {
    const subtle = crypto.subtle;
    return from(
      // @ts-ignore
      subtle.importKey('raw', passwordBytes, { name: 'PBKDF2' }, false, [
        'deriveBits',
      ])
    ).pipe(
      switchMap((pwKey: CryptoKey) => {
        const saltBuffer =
          config.salt && config.salt.buffer ? config.salt.buffer : config.salt;
        const bitsLen = config.hashLen * 8;
        return from(
          subtle.deriveBits(
            {
              name: 'PBKDF2',
              salt: saltBuffer as ArrayBuffer,
              iterations: config.time,
              hash: 'SHA-256',
            },
            pwKey,
            bitsLen
          )
        ).pipe(
          map((derivedBits: ArrayBuffer) => {
            const out = new Uint8Array(derivedBits);
            return out;
          })
        );
      }),
      catchError((err) => {
        // propagate errors as observable error
        return throwError(() => err);
      }),
      finalize(() => {
        // best-effort wipe sensitive buffers
        try {
          passwordBytes.fill(0);
        } catch (e) {
          // ignore, just best-effort
        }
      })
    );
  }
}
