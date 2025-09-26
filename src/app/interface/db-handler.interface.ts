/**
 * VaultEntry stored in IndexedDB.
 * ciphertext and iv are binary (Uint8Array).
 */
export interface VaultEntry {
  id?: number; // primary key (autoIncrement)
  uuid?: string; // optional stable id
  domain: string;
  usernameHint?: string; // optional searchable hint (non-sensitive)
  ciphertext: Uint8Array; // encrypted payload (username/password/notes)
  iv: Uint8Array; // AES-GCM nonce
  createdAt: number;
  updatedAt?: number;
  meta?: Record<string, any>;
}

/**
 * Export format for JSON files (base64 encoded binary)
 */
export interface ExportVaultFormat {
  format: 'mypass-vault';
  version: number;
  createdAt: number;
  app?: { name?: string; build?: string };
  entries: Array<{
    id?: number;
    uuid?: string;
    domain: string;
    usernameHint?: string;
    ciphertext: string; // base64
    iv: string; // base64
    createdAt: number;
    updatedAt?: number;
    meta?: Record<string, any>;
  }>;
}
