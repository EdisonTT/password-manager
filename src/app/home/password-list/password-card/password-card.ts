import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ButtonWrapper, InputWrapper } from '../../../wrappers';
import { ManagePassword } from '../manage-password/manage-password';
import { VaultEntry } from '../../../interface';
import { DbHandler, PasswordManager } from '../../../service';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { PasswordData } from '../interface';
import { HomeNotifier } from '../../service';

@Component({
  selector: 'password-card',
  imports: [InputWrapper, ButtonWrapper, ManagePassword],
  templateUrl: './password-card.html',
  styleUrl: './password-card.scss',
})
export class PasswordCard implements OnInit, OnDestroy {
  public readonly cardData = input.required<VaultEntry>();

  public readonly userName = signal<string>('');
  public readonly password = signal<string>('');
  public readonly domain = signal<string | undefined>(undefined);
  public readonly passwordType = signal<'password' | 'text'>('password');
  public readonly eyeIconPath = computed(() => {
    return `icons/${
      this.passwordType() === 'text' ? 'hide-' : ''
    }eye.icon.svg`;
  });
  public readonly id = computed(() => this.cardData().uuid);

  public readonly showContent = signal<boolean>(false);
  public readonly editModalData = signal<PasswordData | null>(null);

  // services
  private readonly _passwordManager: PasswordManager;
  private readonly _dbHandler: DbHandler;
  private readonly _homeNotifier: HomeNotifier;

  // observables
  private readonly _cardData$: Observable<VaultEntry>;
  private readonly _destroy$ = new Subject<void>();

  // private variables
  private _doesCardExpandedEarlier: boolean = false;

  constructor() {
    this._passwordManager = inject(PasswordManager);
    this._dbHandler = inject(DbHandler);
    this._homeNotifier = inject(HomeNotifier);
    this._cardData$ = toObservable(this.cardData);
  }

  ngOnInit(): void {
    this.subForCardDataChange();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private subForCardDataChange() {
    // ensure that the decryption will happen only if the card is expended and if the input updates.
    this._cardData$.pipe(takeUntil(this._destroy$)).subscribe({
      next: () => {
        if (this.showContent()) this.extractCredentials().subscribe();
      },
    });
  }

  public toggleContent() {
    if (this._doesCardExpandedEarlier) {
      this.showContent.update((current) => !current);
      return;
    }

    // decrypt the cred for first time when the use expand the card.
    this.extractCredentials().subscribe({
      next: () => {
        this._doesCardExpandedEarlier = true;
        this.showContent.update((current) => !current);
      },
      error: () => console.error('Failed to decrypt the data'),
    });
  }

  public togglePassword(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.passwordType.update((prev) =>
      prev === 'password' ? 'text' : 'password'
    );
  }

  public openEditModal() {
    const { id, uuid, title } = this.cardData();
    this.editModalData.set({
      id,
      uuid,
      title,
      userName: this.userName(),
      password: this.password(),
      ...(this.domain() && { domain: this.domain() }),
    });
  }

  public onModalClose() {
    this.editModalData.set(null);
  }

  public deletePassword() {
    this._dbHandler.deleteEntry(this.cardData().id).subscribe({
      next: () => console.log('Entry Deleted'),
      error: () => console.error('Failed to Delete'),
    });
  }

  private extractCredentials() {
    const { ciphertext, iv, domain } = this.cardData();
    return this._passwordManager
      .decryptCredentials({
        ciphertext,
        iv,
        ...(domain && { domain }),
      })
      .pipe(
        map((extractCredentials) => {
          const { username, password } = extractCredentials;
          this.domain.set(domain);
          this.userName.set(username);
          this.password.set(password);
        })
      );
  }

  public copyToClipBoard(contentType: 'domain' | 'password' | 'username') {
    if (!window.navigator?.clipboard) {
      console.error('No clipboard found');
      return;
    }
    let text = '';
    switch (contentType) {
      case 'domain':
        text = this.domain() ?? '';
        break;
      case 'password':
        text = this.password();
        break;
      case 'username':
        text = this.userName();
        break;
    }
    window.navigator.clipboard.writeText(text);
    this._homeNotifier.showNotifier();
  }
}
