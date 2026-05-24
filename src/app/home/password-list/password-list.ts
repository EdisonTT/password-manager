import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';
import { DbHandler } from '../../service';
import { ManagePassword } from './manage-password/manage-password';
import { VaultEntry } from '../../interface';
import { Subject, takeUntil } from 'rxjs';
import { TagFilter, TAG_ALL, TAG_UNTAGGED } from '../service';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard, ManagePassword],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList implements OnInit, OnDestroy {
  private readonly _dbHandlerService: DbHandler;
  private readonly _tagFilter: TagFilter;

  public readonly showPasswordModal = signal<boolean>(false);
  public readonly passwordArray = signal<VaultEntry[]>([]);
  public readonly searchTerm = signal<string>('');
  public readonly activeTag = signal<string>(TAG_ALL);

  public readonly filteredPasswords = computed(() => {
    const keyword = this.searchTerm().trim().toLowerCase();
    const tag = this.activeTag();
    let entries = this.passwordArray();

    if (tag !== TAG_ALL) {
      if (tag === TAG_UNTAGGED) {
        entries = entries.filter((entry) => !entry.tags || entry.tags.length === 0);
      } else {
        entries = entries.filter((entry) => entry.tags && entry.tags.includes(tag));
      }
    }

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
    this._tagFilter = inject(TagFilter);
  }

  ngOnInit(): void {
    this._dbHandlerService.entries$
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        this.passwordArray.set(data);
      });

    this._tagFilter.activeTag$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tag) => {
        this.activeTag.set(tag);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
