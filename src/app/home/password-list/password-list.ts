import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';
import { DbHandler } from '../../service';
import { ManagePassword } from './manage-password/manage-password';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard, ManagePassword],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList implements OnInit {
  private readonly _dbHandlerService: DbHandler;

  public readonly showPasswordModal = signal<boolean>(false);

  constructor() {
    this._dbHandlerService = inject(DbHandler);
  }

  ngOnInit(): void {
    this._dbHandlerService.entries$.subscribe(console.log);
  }

  public buttonClick() {}

  public clearDB() {
    this._dbHandlerService.clearAll().subscribe(() => {
      console.log('All entries cleared');
    });
  }
}
