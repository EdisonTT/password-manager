export const DB_NAME = 'PasswordVaultDB';
export const DB_VERSION = 1;
export const STORE_ENTRIES = 'entries';
export const STORE_METADATA = 'metadata';
export const VAULT_METADATA_KEY = 'vault-metadata' as const;

export const KDF_CONFIG = {
  memory: 64 * 1024, // 64 MB
  time: 3,
  parallelism: 1,
  hashLen: 32,
};
