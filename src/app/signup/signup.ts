import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonWrapper, ERROR_NAME, InputWrapper } from '../wrappers';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SignupForm } from '../interface';
import { FormHelper } from '../service';
import { Subject, takeUntil } from 'rxjs';
import { passwordValidator } from '../helper-functions';
import { SignupService } from '../service/signup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ButtonWrapper, InputWrapper, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup implements OnInit, OnDestroy {
  public readonly signupForm: FormGroup<SignupForm>;

  private _destroy$ = new Subject<void>();
  private readonly _formHelper: FormHelper;
  private readonly _signupService: SignupService;
  private readonly _router: Router;

  constructor() {
    this.signupForm = this.createSignupForm();
    this._formHelper = inject(FormHelper);
    this._signupService = inject(SignupService);
    this._router = inject(Router);
  }

  ngOnInit(): void {
    this.updateConfirmPasswordValidity();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private createSignupForm(): FormGroup<SignupForm> {
    return new FormGroup<SignupForm>({
      name: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      password: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required, passwordValidator()],
      }),
      confirmPassword: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required, this.confirmPasswordMatch()],
      }),
    });
  }

  private confirmPasswordMatch(): ValidatorFn {
    return (control) => {
      if (!this.signupForm) return null;
      const password = this.signupForm.get('password')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword
        ? null
        : { [ERROR_NAME.PASSWORD_MISMATCH]: true };
    };
  }

  private updateConfirmPasswordValidity(): void {
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');
    passwordControl?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        confirmPasswordControl?.updateValueAndValidity();
      });
  }

  public createVault(): void {
    this._formHelper.updateNotifySubmission(true);
    if (this.signupForm.invalid) return;
    const { name, password } = this.signupForm.getRawValue();
    this._signupService.createVault(name!, password!).subscribe({
      next: () => {
        this._formHelper.updateNotifySubmission(false);
        this.signupForm.reset();
        this._router.navigate(['vault']);
      },
      error: (err) => {
        console.error('Error creating vault:', err);
        this._formHelper.updateNotifySubmission(false);
      },
    });
  }
}
