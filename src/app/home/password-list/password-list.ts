import { Component, inject, OnInit } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';
import { DbHandler, DbHelper } from '../../service';
import { VaultEntry } from '../../interface';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList implements OnInit {
  private readonly _dbHandlerService: DbHandler;

  constructor() {
    this._dbHandlerService = inject(DbHandler);
  }

  ngOnInit(): void {
    this._dbHandlerService.entries().subscribe(console.log);
  }

  public buttonClick() {
    const dummyEntry = {
      uuid: '550e8400-e29c-41d4-a716-446655440000', // sample UUID v4
      domain: 'example.com',
      usernameHint: 'alice', // non-sensitive search hint
      ciphertext: new Uint8Array([72, 201, 33, 44, 55, 66, 177, 88]), // fake encrypted bytes
      iv: new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]), // 12-byte AES-GCM nonce
      meta: {
        notes: 'Sample dummy record',
        lastUsedAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
        tags: ['test', 'dummy'],
      },
    };

    this._dbHandlerService
      .addEntry(dummyEntry)
      .subscribe((entry) => console.log('Added entry', entry));
  }

  public clearDB() {
    this._dbHandlerService.clearAll().subscribe(() => {
      console.log('All entries cleared');
    });
  }
}
