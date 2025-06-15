import { Component, input } from '@angular/core';
import { InputWrapperMetaData } from '../interface';

@Component({
  selector: 'input-wrapper',
  imports: [],
  templateUrl: './input-wrapper.html',
  styleUrl: './input-wrapper.scss',
})
export class InputWrapper {
  metaData = input.required<InputWrapperMetaData>();
  label = input<string>();
  placeholder = input<string>('');
  type = input<string>('text');
}
