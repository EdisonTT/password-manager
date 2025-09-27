import { ErrorMessage } from '../interface';

// keep in sync with Angular Validators manually
export const ERROR_NAME = {
  REQUIRED: 'required',
} as const;

export const ERROR_MESSAGE: ErrorMessage = {
  required: {
    message: 'This field is required',
    priority: 1,
  },
};
