import { Component, inject, OnInit, output, signal } from '@angular/core';
import { ModalWrapper, InputWrapper, ButtonWrapper } from '../../../wrappers';
import { ManagePasswordForm } from '../interface';
import {
  Form,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormHelper } from '../../../service/form-helper.service';

@Component({
  selector: 'manage-password',
  imports: [ReactiveFormsModule, ModalWrapper, InputWrapper, ButtonWrapper],
  templateUrl: './manage-password.html',
  styleUrl: './manage-password.scss',
})
export class ManagePassword implements OnInit {
  public readonly onClose = output<void>();

  public readonly passwordForm = this.createForm();

  // services
  public readonly _formHelper: FormHelper;
  constructor() {
    this._formHelper = inject(FormHelper);
  }

  ngOnInit(): void {}

  private createForm(): FormGroup<ManagePasswordForm> {
    return new FormGroup({
      userName: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required]),
      domain: new FormControl<string | null>(null, [Validators.required]),
      tags: new FormControl<string | null>(null),
    });
  }

  public closeModal() {
    this.onClose.emit();
  }

  public onSubmit() {
    console.log(this.passwordForm.getRawValue());
    this._formHelper.updateNotifySubmission(true);
  }
}
