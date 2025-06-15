import { Component } from '@angular/core';
import { ButtonWrapper, InputWrapper } from '../../wrappers';
import { PasswordCard } from './password-card/password-card';

@Component({
  selector: 'password-list',
  imports: [ButtonWrapper, InputWrapper, PasswordCard],
  templateUrl: './password-list.html',
  styleUrl: './password-list.scss',
})
export class PasswordList {}
