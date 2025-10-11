import { inject, Injectable } from '@angular/core';
import { VaultMetadata } from '../interface';
import { DbHandler } from './db-handler.service';
import { BehaviorSubject, Observable, switchMap, take } from 'rxjs';
import { PasswordManager } from './password-manager.service';
import { SignupService } from './signup.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _vaultMetadata: VaultMetadata | null = null;

  private readonly _dbHandler: DbHandler;
  private readonly _passwordManager: PasswordManager;
  private readonly _signUP: SignupService;

  private readonly hasVaultMetadata = new BehaviorSubject<boolean | null>(null);

  constructor() {
    this._dbHandler = inject(DbHandler);
    this._passwordManager = inject(PasswordManager);
    this._signUP = inject(SignupService);
    this.fetchVaultMetadata();
  }

  getOwnerName(): string {
    return this._vaultMetadata ? this._vaultMetadata.userName : '';
  }

  get hasVaultMetadata$() {
    return this.hasVaultMetadata.asObservable();
  }

  public login(key: string): Observable<boolean> {
    const {
      kdf,
      kdfParams,
      test: { iv, ciphertext },
    } = this._vaultMetadata!;
    const isArgon2id = kdf === 'Argon2id';
    // create the master key with user entered password and kdf params from metadata
    return this._signUP.derivekey(key, kdfParams, isArgon2id).pipe(
      switchMap(({ key }) => {
        this._passwordManager.setMasterKey(key);
        key.fill(0);
        return this._passwordManager.decryptTestString(iv, ciphertext);
      })
    );
  }

  // ensure that db is connected before calling this method
  // handled in guard level
  private fetchVaultMetadata(): void {
    this._dbHandler.getVaultMetadata().subscribe({
      next: (metadata) => {
        this._vaultMetadata = metadata || null;
        this.hasVaultMetadata.next(metadata?.kind === 'vault-metadata');
      },
      error: (err) => {
        console.error('Error fetching vault metadata:', err);
        this.hasVaultMetadata.next(false);
        this._vaultMetadata = null;
      },
    });
  }

  public clearData() {
    this._passwordManager.clearMasterKey();
    this._vaultMetadata = null;
    this.hasVaultMetadata.next(null);
    return this._dbHandler.deleteDB();
  }

  public logout() {
    this._passwordManager.clearMasterKey();
  }
}
