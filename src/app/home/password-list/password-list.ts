import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';
import { DbHandler } from '../../service';
import { ManagePassword } from './manage-password/manage-password';
import { VaultEntry } from '../../interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard, ManagePassword],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList implements OnInit, OnDestroy {
  private readonly _dbHandlerService: DbHandler;

  public readonly showPasswordModal = signal<boolean>(false);
  public readonly passwordArray = signal<VaultEntry[]>([]);

  private readonly _destroy$ = new Subject<void>();

  constructor() {
    this._dbHandlerService = inject(DbHandler);
  }

  ngOnInit(): void {
    this._dbHandlerService.entries$
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        this.passwordArray.set(data);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
