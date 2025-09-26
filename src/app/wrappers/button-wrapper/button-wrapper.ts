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
  public readonly buttonType = input<ButtonType>(PRIMARY_BUTTON);
  public readonly isDisabled = input<boolean>(false);
  public readonly buttonText = input.required<string>();

  public readonly clicked = output<void>();

  // computed properties
  public readonly addPrimaryClass = computed(
    () => this.buttonType() === PRIMARY_BUTTON
  );
  public readonly addSecondaryClass = computed(
    () => this.buttonType() === SECONDARY_BUTTON
  );

  public clickHandler() {
    if (this.isDisabled()) return;
    console.log('Button clicked 111');
    this.clicked.emit();
  }
}
