import { Component, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { ModalWrapper, InputWrapper, ButtonWrapper, SelectWrapper } from '../../../wrappers';
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
import { VaultDataFromClient } from '../../../interface';
import { catchError, of, switchMap, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'manage-password',
  imports: [ReactiveFormsModule, ModalWrapper, InputWrapper, ButtonWrapper],
  templateUrl: './manage-password.html',
  styleUrl: './manage-password.scss',
})
export class ManagePassword implements OnInit, OnDestroy {
  // inputs
  public readonly data = input<PasswordData | null>(null);

  // true - save and close
  // false - close
  public readonly onClose = output<boolean>();

  public readonly passwordForm = this.createForm();

  private _id: number | null = null;
  private _uuid: string | null = null;

  private readonly _destroy$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private createForm(): FormGroup<ManagePasswordForm> {
    return new FormGroup({
      title: new FormControl<string | null>(null, [Validators.required]),
      userName: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required]),
      domain: new FormControl<string | null>(null),
    });
  }

  private handleEditMode() {
    const id = this.data()?.id;
    // if ID is there, UUID will also be there, uuid is kept as a backup for id
    if (!id) return;
    const { uuid, title, userName, password, domain } = this.data()!;
    this._id = id;
    this._uuid = uuid!;

    // const data = this.extractData();
    this.passwordForm.patchValue({
      title,
      userName,
      password,
      ...(domain && { domain }),
    });
  }

  public closeModal(flag: boolean) {
    this.onClose.emit(flag);
  }

  public onSubmit() {
    if (this.passwordForm.invalid) {
      this._formHelper.updateNotifySubmission(true);
      return;
    }
    const formData =
      this.passwordForm.getRawValue() as ManagePasswordFormRawAfterValidation;
    const { userName, password, domain } = formData;

    this._passwordManager
      .encryptCredentials({
        userName,
        password,
        domain: domain || undefined, // using || to avoid empty string
      })
      .pipe(
        switchMap((res) => {
          const toStore: VaultDataFromClient = {
            uuid: this._uuid ?? crypto.randomUUID(),
            title: formData.title,
            domain: domain || '',
            ciphertext: res.ciphertext,
            iv: res.iv,
          };
          return this._id
            ? this._dbHandler.updateEntry(this._id, toStore)
            : this._dbHandler.addEntry(toStore);
        }),
        catchError((err) => {
          console.error(err);
          console.error('Failed to save the credentials');
          return of(null);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) return;
          this._id = res.id ?? null;
          this._uuid = res.uuid ?? null;
          this.closeModal(true);
        },
      });
  }
}
