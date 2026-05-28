import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { ButtonWrapper } from '../../wrappers';
import { DbHandler } from '../../service';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { VaultEntry } from '../../interface';

@Component({
  selector: 'app-settings',
  imports: [ButtonWrapper],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings implements OnInit, OnDestroy {
  private readonly _dbHandler = inject(DbHandler);
  private readonly _destroy$ = new Subject<void>();
  private _currentEntries: VaultEntry[] = [];

  public uiMessage = signal('');

  private setMsg(msg: string) {
    this.uiMessage.set(msg);
    if (msg) setTimeout(() => this.uiMessage.set(''), 3000);
  }

  ngOnInit(): void {
    this._dbHandler.entries$.pipe(takeUntil(this._destroy$)).subscribe(entries => {
      this._currentEntries = entries;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public exportVault() {
    this.setMsg('Starting export...');
    console.log('[Settings] Starting export...');

    try {
      this.uiMessage.set('Converting entries...');
      console.log('[Settings] Converting entries...');
      const serializedEntries = this._currentEntries.map(entry => ({
        ...entry,
        ciphertext: Array.from(entry.ciphertext),
        iv: Array.from(entry.iv)
      }));
      
      this.uiMessage.set('Fetching metadata...');
      console.log('[Settings] Fetching metadata...');
      this._dbHandler.getVaultMetadata().subscribe({
        next: async (metadata) => {
          console.log('[Settings] Metadata fetched', metadata);
          try {
            if (!metadata) throw new Error('No metadata found in vault.');

            const serializedMetadata = {
              ...metadata,
              kdfParams: {
                ...metadata.kdfParams,
                salt: Array.from(metadata.kdfParams.salt)
              },
              test: {
                ...metadata.test,
                iv: Array.from(metadata.test.iv),
                ciphertext: Array.from(metadata.test.ciphertext)
              }
            };

            this.uiMessage.set('Selecting save location...');
            console.log('[Settings] Selecting save location...');
            const exportData = JSON.stringify({ metadata: serializedMetadata, entries: serializedEntries });
            
            const filePath = await save({
              filters: [{ name: 'JSON', extensions: ['json'] }],
              defaultPath: 'vault-export.json'
            });

            if (filePath) {
              await writeTextFile(filePath, exportData);
              this.uiMessage.set('Vault exported successfully!');
              setTimeout(() => this.uiMessage.set(''), 3000);
            } else {
              this.uiMessage.set('');
            }
          } catch (innerErr: any) {
            console.error('[Settings] Inner Error', innerErr);
            this.uiMessage.set('Inner Error: ' + innerErr.message);
          }
        },
        error: (err) => {
          console.error('[Settings] DB Error', err);
          this.uiMessage.set('DB Error: ' + err.message);
        }
      });
    } catch (err: any) {
      console.error('[Settings] Error', err);
      this.uiMessage.set('Error: ' + err.message);
    }
  }
}
