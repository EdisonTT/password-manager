import { PasswordValidatorConfig } from '../interface';

export const DEFAULT_PASSWORD_CONFIG: PasswordValidatorConfig = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSpecial: true,
  noSpaces: true,
};
