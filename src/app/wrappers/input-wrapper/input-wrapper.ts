import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { ErrorFromControl } from '../interface';
import { FormHelper } from '../../service';

@Component({
  selector: 'input-wrapper',
  imports: [],
  templateUrl: './input-wrapper.html',
  styleUrl: './input-wrapper.scss',
})
export class InputWrapper implements OnInit, OnDestroy, ControlValueAccessor {
  public readonly id = input.required<string>();
  public readonly errorMessage = input<string | null>(null);
  public readonly label = input<string>();
  public readonly placeholder = input<string>('');
  public readonly type = input<string>('text');
  public readonly isMandatory = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly value = input<string>('');
  // show password icon happens by default for password type
  // Use this to disable it
  public readonly showDefaultPasswordIcon = input<boolean>(true);

  public readonly showEyeIcon = signal(false);
  public readonly hasFormControl = signal(false);
  public readonly localType = signal('');
  public readonly localValue = signal<string>('');
  public readonly localErrorMessage = signal<string | null>(null);

  public readonly passwordIconUrl = computed(() =>
    this.localType() === 'password' && this.showEyeIcon()
      ? 'icons/eye.icon.svg'
      : 'icons/hide-eye.icon.svg'
  );

  private _ngControl: NgControl | null;
  private _control: FormControl<string> | null = null;
  private readonly _destroy$ = new Subject<void>();
  private readonly _formHelper: FormHelper;

  private _onTouched: () => void = () => {};
  private _onChange: (value: any) => void = () => {};

  constructor() {
    this._ngControl = inject(NgControl, { self: true, optional: true });
    this._formHelper = inject(FormHelper);
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }

    // Updating the localValue if input value is changed and has no form control
    effect(() => {
      if (this.hasFormControl()) return;
      this.localValue.set(this.value());
    });

    // Updating the localErrorMessage if input errorMessage is changed and has no form control
    effect(() => {
      if (this.hasFormControl()) return;
      this.localErrorMessage.set(this.errorMessage());
    });

    effect(() => {
      this.localType.set(this.type());
      if (this.showDefaultPasswordIcon() && this.type() === 'password') {
        // Using signal instead of computed to avoid unnecessary re-evaluations
        this.showEyeIcon.set(true);
      }
    });
  }

  public ngOnInit(): void {
    this.initiateControllerSettings();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private initiateControllerSettings() {
    if (this._ngControl) {
      this._control = this._ngControl.control as FormControl | null;
      if (this._control) this.hasFormControl.set(true);
      this.subscribeToValidationErrors();
    }
  }

  public onChangeEvent(event: Event) {
    if (this.disabled()) return;
    const value = (event.target as HTMLInputElement).value;
    this._onChange(value);
  }

  public onClickEvent() {
    if (this.disabled()) return;
    this._onTouched();
  }

  writeValue(text: string): void {
    this.localValue.set(text);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public togglePasswordVisibility() {
    this.localType.update((currentType) =>
      currentType === 'password' ? 'text' : 'password'
    );
  }

  private subscribeToValidationErrors() {
    // As of now field is not disabled automatically if form control is disabled
    // Implement the logic here if needed in future
    if (!this._control) return;

    this._formHelper.submissionNotifier$
      .pipe(
        takeUntil(this._destroy$),
        switchMap((submissionStatus) => {
          // check errors for the first time when form is submitted as statusChanges won't emit on its own
          if (submissionStatus) this.checkForErrors();
          // check for errors only if form is submitted
          // cancel if it previous subscription if submissionStatus is false
          return !submissionStatus
            ? of(undefined)
            : this._control!.statusChanges;
        })
      )
      .subscribe((value) => {
        this.checkForErrors();
      });
  }

  private checkForErrors() {
    if (!this._control) return;
    const errors = this._control?.errors;
    const errorMessage = this._formHelper.getErrorMessage(
      errors as ErrorFromControl
    );
    this.localErrorMessage.set(errorMessage);
  }
}
