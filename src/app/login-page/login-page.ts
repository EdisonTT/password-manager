import { Component, inject, OnInit, signal } from '@angular/core';
import { InputWrapper, ButtonWrapper, ERROR_NAME } from '../wrappers';
import { Router } from '@angular/router';
import { SECONDARY_BUTTON } from '../wrappers';
import { FormHelper, LoginService } from '../service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'login-page',
  imports: [InputWrapper, ButtonWrapper, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  // public Properties
  public readonly buttonTypeSecondary = SECONDARY_BUTTON;
  public readonly ownerName = signal<string>('');

  public readonly passwordControl = new FormControl('', [Validators.required]);

  //private properties
  private readonly _router: Router;
  private readonly _login: LoginService;
  private readonly _formHelper: FormHelper;

  constructor() {
    this._router = inject(Router);
    this._login = inject(LoginService);
    this._formHelper = inject(FormHelper);
  }

  ngOnInit(): void {
    this.ownerName.set(this._login.getOwnerName());
  }

  login() {
    if (this.passwordControl.invalid) {
      this._formHelper.updateNotifySubmission(true);
      return;
    }
    this._login.login(this.passwordControl.value!).subscribe((isSuccess) => {
      if (!isSuccess) {
        this.passwordControl.setErrors({
          [ERROR_NAME.INVALID_MASTER_PASSWORD]: true,
        });
        return;
      }
      this._router.navigate(['/vault']);
    });
  }

  resetApp() {
    this._login.clearData().subscribe(() => {
      console.log('Navigating to signup');
      this._router.navigate(['signup']);
    });
  }
}
