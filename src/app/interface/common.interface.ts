import { FormControl } from '@angular/forms';

export type FormRawValue<T> = {
  [key in keyof T]: T[key] extends FormControl<infer V> ? V : never;
};

export type FormValueWithoutNull<T> = {
  [key in keyof T]: T[key] extends FormControl<infer V>
    ? Exclude<V, null>
    : never;
};

export type PasswordValidatorConfig = Partial<{
  minLength: number;
  requireUpper: boolean;
  requireLower: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  noSpaces: boolean;
}>;
