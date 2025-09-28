import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';
import { DbHandler } from '../../service';
import { ManagePassword } from './manage-password/manage-password';
import { VaultEntry } from '../../interface';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard, ManagePassword],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList implements OnInit {
  private readonly _dbHandlerService: DbHandler;

  public readonly showPasswordModal = signal<boolean>(false);
  public readonly passwordArray = signal<VaultEntry[]>([]);

  constructor() {
    this._dbHandlerService = inject(DbHandler);
  }

  ngOnInit(): void {
    this._dbHandlerService.entries$.subscribe(console.log);
    this._dbHandlerService.temporaryData$.subscribe((data) => {
      this.passwordArray.set(data);
    });
  }
}
