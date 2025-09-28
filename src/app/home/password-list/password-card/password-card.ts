import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../../wrappers';
import { ManagePassword } from '../manage-password/manage-password';
import { VaultEntry } from '../../../interface';
import { PasswordManager } from '../../../service';

@Component({
  selector: 'password-card',
  imports: [InputWrapper, ButtonWrapper, ManagePassword],
  templateUrl: './password-card.html',
  styleUrl: './password-card.scss',
})
export class PasswordCard implements OnInit {
  public readonly id = input.required<string>();
  public readonly cardData = input.required<VaultEntry>();

  public readonly userName = signal<string>('');
  public readonly password = signal<string>('');
  public readonly domain = signal<string>('');
  public readonly passwordType = signal<'password' | 'text'>('password');
  public readonly eyeIconPath = computed(() => {
    return `/icons/${
      this.passwordType() === 'text' ? 'hide-' : ''
    }eye.icon.svg`;
  });

  public readonly showContent = signal<boolean>(false);
  public readonly showPasswordModal = signal<boolean>(false);

  // services
  private readonly _passwordManager: PasswordManager;

  constructor() {
    this._passwordManager = inject(PasswordManager);
  }

  ngOnInit(): void {
    this.extractCredentials();
  }

  public toggleContent() {
    this.showContent.update((current) => !current);
  }

  public togglePassword(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.passwordType.update((prev) =>
      prev === 'password' ? 'text' : 'password'
    );
  }

  public openManagePassword() {
    this.showPasswordModal.set(true);
  }

  private extractCredentials() {
    const { ciphertext, iv, domain } = this.cardData();
    this._passwordManager
      .decryptCredentials({
        ciphertext,
        iv,
        ...(domain && { domain }),
      })
      .subscribe({
        next: (extractCredentials) => {
          console.log(extractCredentials);
          const { username, password } = extractCredentials;
          this.domain.set(domain);
          this.userName.set(username);
          this.password.set(password);
        },
        error: (error) => {
          console.log('error while decrypting');
        },
      });
  }
}
