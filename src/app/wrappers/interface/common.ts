import { ERROR_NAME } from '../const';

export type ErrorName = (typeof ERROR_NAME)[keyof typeof ERROR_NAME];

export type ErrorMessageItem = {
  message: string;
  priority: number;
};
export type ErrorMessage = {
  [key in ErrorName]: ErrorMessageItem;
};

export type ErrorFromControl =
  | {
      [key in ErrorName]: unknown;
    }
  | null;
