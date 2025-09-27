import { Component, input, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../../wrappers';
import { ManagePassword } from '../manage-password/manage-password';

@Component({
  selector: 'password-card',
  imports: [InputWrapper, ButtonWrapper, ManagePassword],
  templateUrl: './password-card.html',
  styleUrl: './password-card.scss',
})
export class PasswordCard {
  public readonly id = input.required<string>();

  public readonly showContent = signal<boolean>(false);
  public readonly showPasswordModal = signal<boolean>(false);

  public toggleContent() {
    this.showContent.update((current) => !current);
  }

  public openManagePassword() {
    this.showPasswordModal.set(true);
  }
}
