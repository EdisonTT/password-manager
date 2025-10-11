import { ErrorMessage } from '../interface';

// keep in sync with Angular Validators manually
export const ERROR_NAME = {
  REQUIRED: 'required',
  PASSWORD_MISMATCH: 'passwordMismatch',
  PASS_MIN_LENGTH: 'passMinLength',
  PASS_MIN_UPPER: 'passMinUpper',
  PASS_MIN_LOWER: 'passMinLower',
  PASS_MIN_DIGIT: 'passMinDigit',
  PASS_MIN_SPECIAL: 'passMinSpecial',
  PASS_NO_SPACES: 'passNoSpaces',
  INVALID_MASTER_PASSWORD: 'invalidMasterPassword',
} as const;

export const ERROR_MESSAGE: ErrorMessage = {
  required: {
    message: 'This field is required',
    priority: 1,
  },
  // Password related errors
  passwordMismatch: {
    message: 'Passwords do not match',
    priority: 100,
  },
  passMinLength: {
    message: 'Password is too short',
    priority: 101,
  },
  passMinUpper: {
    message: 'Password must contain at least one uppercase letter',
    priority: 102,
  },
  passMinLower: {
    message: 'Password must contain at least one lowercase letter',
    priority: 103,
  },
  passMinDigit: {
    message: 'Password must contain at least one digit',
    priority: 104,
  },
  passMinSpecial: {
    message: 'Password must contain at least one special character',
    priority: 105,
  },
  passNoSpaces: {
    message: 'Password must not contain spaces',
    priority: 106,
  },
  invalidMasterPassword: {
    message: 'Invalid master password',
    priority: 107,
  },
};
