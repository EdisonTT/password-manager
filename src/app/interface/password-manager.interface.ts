export interface RawCredentials {
  userName: string;
  password: string;
  domain?: string;
}

export interface DataToEncrypt {
  username: string;
  password: string;
}
export type ExtractedCredentials = DataToEncrypt; // both are same, but using different names for clarity;

export interface EncryptedCredentials {
  ciphertext: Uint8Array;
  iv: Uint8Array;
}

export interface DataToDecrypt extends EncryptedCredentials {
  domain?: string;
}
