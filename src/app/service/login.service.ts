import { inject, Injectable } from '@angular/core';
import { VaultMetadata } from '../interface';
import { DbHandler } from './db-handler.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _vaultMetadata: VaultMetadata | null = null;

  private _dbHandler: DbHandler;

  constructor() {
    this._dbHandler = inject(DbHandler);
    this.fetchVaultMetadata();
  }

  public login(key: string): boolean {
    this.fetchVaultMetadata();
    return true;
  }

  private fetchVaultMetadata(): void {
    this._dbHandler.getVaultMetadata().subscribe((metadata) => {
      this._vaultMetadata = metadata;
      console.log('Fetched vault metadata:', metadata);
    });
  }

  getDerivedKey(): Uint8Array {
    return new Uint8Array();
  }
}
