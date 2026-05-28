import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
  public readonly searchTerm = signal<string>('');

  public readonly filteredPasswords = computed(() => {
    const keyword = this.searchTerm().trim().toLowerCase();
    let entries = this.passwordArray();

    if (!keyword) return entries;
    return entries.filter((entry) => {
      const title = entry.title?.toLowerCase() ?? '';
      const domain = entry.domain?.toLowerCase() ?? '';
      return title.includes(keyword) || domain.includes(keyword);
    });
  });

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
