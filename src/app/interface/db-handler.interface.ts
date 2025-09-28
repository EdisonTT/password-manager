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
