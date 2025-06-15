import { Component, inject } from '@angular/core';
import { InputWrapper, ButtonWrapper } from '../wrappers';
import { Router } from '@angular/router';
import { SECONDARY_BUTTON } from '../wrappers';

@Component({
  selector: 'app-login-page',
  imports: [InputWrapper, ButtonWrapper],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  // public Properties
  public readonly buttonTypeSecondary = SECONDARY_BUTTON;

  //private properties
  private _router: Router;
  constructor() {
    this._router = inject(Router);
  }

  loginClickHandler() {
    this._router.navigate(['home']);
  }
}
