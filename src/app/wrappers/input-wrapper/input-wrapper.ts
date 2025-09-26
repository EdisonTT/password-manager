import { Component, input } from '@angular/core';

@Component({
  selector: 'input-wrapper',
  imports: [],
  templateUrl: './input-wrapper.html',
  styleUrl: './input-wrapper.scss',
})
export class InputWrapper {
  id = input.required<string>();
  label = input<string>();
  placeholder = input<string>('');
  type = input<string>('text');
}
