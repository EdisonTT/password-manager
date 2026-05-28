import {
  Component,
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
  selector: 'select-wrapper',
  imports: [],
  templateUrl: './select-wrapper.html',
  styleUrl: './select-wrapper.scss',
})
export class SelectWrapper implements OnInit, OnDestroy, ControlValueAccessor {
  public readonly id = input.required<string>();
  public readonly errorMessage = input<string | null>(null);
  public readonly label = input<string>();
  public readonly placeholder = input<string>('');
  public readonly isMandatory = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly value = input<string>('');
  public readonly options = input.required<string[]>();

  public readonly hasFormControl = signal(false);
  public readonly localValue = signal<string>('');
  public readonly localErrorMessage = signal<string | null>(null);

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
    const value = (event.target as HTMLSelectElement).value;
    this._onChange(value);
    this.localValue.set(value);
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

  private subscribeToValidationErrors() {
    if (!this._control) return;

    this._formHelper.submissionNotifier$
      .pipe(
        takeUntil(this._destroy$),
        switchMap((submissionStatus) => {
          if (submissionStatus) this.checkForErrors();
          return !submissionStatus
            ? of(undefined)
            : this._control!.statusChanges;
        })
      )
      .subscribe(() => {
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
