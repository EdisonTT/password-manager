import { Injectable } from '@angular/core';
import { VaultEntry } from '../interface';

@Injectable({
  providedIn: 'root',
})
export class DbHelper {
  constructor() {}

  public normalizeToUint8(v: any): Uint8Array {
    if (!v) return new Uint8Array(0);
    if (v instanceof Uint8Array) return v;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v))
      return new Uint8Array(v);
    if (v instanceof ArrayBuffer) return new Uint8Array(v);
    if (Array.isArray(v)) return new Uint8Array(v);
    if (v && typeof v === 'object' && Array.isArray((v as any).data)) {
      return new Uint8Array((v as any).data);
    }
    throw new Error('Unsupported binary format in DB');
  }

  public cloneEntry(e: VaultEntry): VaultEntry {
    return {
      ...e,
      ciphertext: e.ciphertext
        ? new Uint8Array(e.ciphertext)
        : new Uint8Array(0),
      iv: e.iv ? new Uint8Array(e.iv) : new Uint8Array(0),
      tags: e.tags ?? [],
    };
  }
}
