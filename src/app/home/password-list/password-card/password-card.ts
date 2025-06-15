import { Component, input, signal } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../../wrappers';

@Component({
  selector: 'password-card',
  imports: [InputWrapper, ButtonWrapper],
  templateUrl: './password-card.html',
  styleUrl: './password-card.scss',
})
export class PasswordCard {
  id = input.required<string>();

  public readonly showContent = signal<boolean>(false);

  toggleContent() {
    this.showContent.update((current) => !current);
  }
}
