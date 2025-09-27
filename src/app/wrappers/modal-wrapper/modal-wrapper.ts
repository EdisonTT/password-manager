import { Component, input, output } from '@angular/core';

@Component({
  selector: 'modal-wrapper',
  imports: [],
  templateUrl: './modal-wrapper.html',
  styleUrl: './modal-wrapper.scss',
})
export class ModalWrapper {
  public readonly headerText = input<string>('');
  public readonly showCloseButton = input<boolean>(false);
  public readonly closeModal = output<void>();
}
