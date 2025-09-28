import { Component, inject, input, OnInit, output } from '@angular/core';
import { ModalWrapper, InputWrapper, ButtonWrapper } from '../../../wrappers';
import {
  ManagePasswordForm,
  ManagePasswordFormRawAfterValidation,
  PasswordData,
} from '../interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DbHandler, FormHelper, PasswordManager } from '../../../service';
import { VaultDataFromClient, VaultEntry } from '../../../interface';

@Component({
  selector: 'manage-password',
  imports: [ReactiveFormsModule, ModalWrapper, InputWrapper, ButtonWrapper],
  templateUrl: './manage-password.html',
  styleUrl: './manage-password.scss',
})
export class ManagePassword implements OnInit {
  // inputs
  public readonly passwordData = input<PasswordData | null>(null);

  public readonly onClose = output<void>();

  public readonly passwordForm = this.createForm();

  // services
  private readonly _formHelper: FormHelper;
  private readonly _passwordManager: PasswordManager;
  private readonly _dbHandler: DbHandler;
  constructor() {
    this._formHelper = inject(FormHelper);
    this._passwordManager = inject(PasswordManager);
    this._dbHandler = inject(DbHandler);
  }

  ngOnInit(): void {
    this.handleEditMode();
  }

  private createForm(): FormGroup<ManagePasswordForm> {
    return new FormGroup({
      title: new FormControl<string | null>(null, [Validators.required]),
      userName: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required]),
      domain: new FormControl<string | null>(null),
      tags: new FormControl<string | null>(null),
    });
  }

  private handleEditMode() {
    // if (!this.passwordData()) return;
    // const data = this.extractData();
    this.passwordForm.patchValue({
      title: 'test',
      userName: 'test',
      password: 'test',
      domain: 'test.com',
      tags: 'test',
    });
  }

  // private extractData(): ManagePasswordFormRawAfterValidation {
  //   return {
  //     title: 'test',
  //     userName: 'test',
  //     password: 'test',
  //     domain: 'test.com',
  //     tags: 'test',
  //   };
  // }

  public closeModal() {
    this.onClose.emit();
  }

  public onSubmit() {
    if (this.passwordForm.invalid) {
      this._formHelper.updateNotifySubmission(true);
      return;
    }
    const formData =
      this.passwordForm.getRawValue() as ManagePasswordFormRawAfterValidation;
    const { userName, password, domain, tags } = formData;

    console.log(formData);
    this._passwordManager
      .encryptCredentials({
        userName,
        password,
        domain: domain || undefined, // using || to avoid empty string
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          const toStore: VaultDataFromClient = {
            uuid: crypto.randomUUID(),
            title: formData.title,
            domain: domain || '',
            ciphertext: res.ciphertext,
            iv: res.iv,
            tags: tags ? [tags] : undefined,
          };
          this._dbHandler.setTemporaryData(toStore as VaultEntry);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
