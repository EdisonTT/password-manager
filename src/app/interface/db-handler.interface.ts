import { VAULT_METADATA_KEY } from '../const/db-handler.const';
export interface VaultEntry {
  id: number;
  uuid: string;
  title: string;
  domain?: string;
  ciphertext: Uint8Array;
  iv: Uint8Array;
  createdAt: number;
  updatedAt?: number;
  tags?: string[];
}

export type VaultDataFromClient = Omit<
  VaultEntry,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface KDFParams {
  salt: Uint8Array;
  memory: number; // in KB or bytes — be explicit in your schema
  time: number; // passes/iterations
  parallelism: number;
  hashLen: number;
}

export interface VaultMetadata {
  kind: typeof VAULT_METADATA_KEY;
  version: number;
  kdf: 'Argon2id' | 'pbkdf2';
  userName: string;
  kdfParams: KDFParams;
  test: {
    iv: Uint8Array;
    ciphertext: Uint8Array;
  };
  createdAt: string;
}
