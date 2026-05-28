import { Component, input, output } from '@angular/core';
import { ModalWrapper } from '../modal-wrapper/modal-wrapper';
import { ButtonWrapper } from '../button-wrapper/button-wrapper';

@Component({
  selector: 'confirmation-popup-wrapper',
  imports: [ModalWrapper, ButtonWrapper],
  templateUrl: './confirmation-popup-wrapper.html',
  styleUrl: './confirmation-popup-wrapper.scss',
})
export class ConfirmationPopupWrapper {
  public readonly headerText = input<string>('Confirm');
  public readonly message = input<string>('Are you sure?');
  public readonly confirmText = input<string>('Yes');
  public readonly cancelText = input<string>('No');
  
  public readonly confirm = output<void>();
  public readonly cancel = output<void>();
}
