import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PasswordValidatorConfig } from '../interface';
import { DEFAULT_PASSWORD_CONFIG } from '../const';
import { ERROR_NAME } from '../wrappers';

export const passwordValidator: (
  config?: PasswordValidatorConfig
) => ValidatorFn = (config = DEFAULT_PASSWORD_CONFIG) => {
  const specialRegex = /[!@#\$%\^&\*\(\)\[\]\-_\+=\{\}\|;:'",<\.>\/\?`~]/;
  const upperRegex = /[A-Z]/;
  const lowerRegex = /[a-z]/;
  const digitRegex = /\d/;
  const spaceRegex = /\s/;
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value ?? '';
    if (!v) return null;
    if (config.minLength && v.length < config.minLength)
      return {
        [ERROR_NAME.PASS_MIN_LENGTH]: {
          requiredLength: config.minLength,
          actualLength: v.length,
        },
      };
    if (config.requireUpper && !upperRegex.test(v))
      return {
        [ERROR_NAME.PASS_MIN_UPPER]: true,
      };
    if (config.requireLower && !lowerRegex.test(v))
      return {
        [ERROR_NAME.PASS_MIN_LOWER]: true,
      };
    if (config.requireDigit && !digitRegex.test(v))
      return {
        [ERROR_NAME.PASS_MIN_DIGIT]: true,
      };
    if (config.requireSpecial && !specialRegex.test(v))
      return {
        [ERROR_NAME.PASS_MIN_SPECIAL]: true,
      };
    if (config.noSpaces && spaceRegex.test(v))
      return {
        [ERROR_NAME.PASS_NO_SPACES]: true,
      };
    return null;
  };
};
