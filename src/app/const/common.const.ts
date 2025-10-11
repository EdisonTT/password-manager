import { PasswordValidatorConfig } from '../interface';

export const DEFAULT_PASSWORD_CONFIG: PasswordValidatorConfig = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
  requireSpecial: true,
  noSpaces: true,
};

export const KDF_CONFIG = {
  memory: 64 * 1024, // 64 MB
  time: 3,
  parallelism: 1,
  hashLen: 32,
};

export const TEST_STRING = 'vault-v1:test' as const;
