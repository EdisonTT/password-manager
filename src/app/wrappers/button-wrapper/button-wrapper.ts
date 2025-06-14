import { Component, computed, input, output } from '@angular/core';
import { ButtonType } from '../interface';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../const';

@Component({
  selector: 'button-wrapper',
  imports: [],
  templateUrl: './button-wrapper.html',
  styleUrl: './button-wrapper.scss',
})
export class ButtonWrapper {
  buttonType = input<ButtonType>(PRIMARY_BUTTON);
  isDisabled = input<boolean>(false);
  buttonText = input.required<string>();

  // computed properties
  addPrimaryClass = computed(() => this.buttonType() === PRIMARY_BUTTON);
  addSecondaryClass = computed(() => this.buttonType() === SECONDARY_BUTTON);
  click = output<void>();

  clickHandler() {
    if (this.isDisabled()) return;
    this.click.emit();
  }
}
