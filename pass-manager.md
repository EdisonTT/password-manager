# 🚀 Architectural Plan

### Phase 1: Core Vault & Encryption (Local only)

1. **App Startup**
   
   * Show *Master Password* prompt (new user sets it, existing user enters it).

2. **Key Derivation**
   
   * Use KDF (PBKDF2/Argon2/scrypt) with stored salt (saved inside IndexedDB metadata) to generate encryption key.

3. **Authentication**
   
   * Attempt to decrypt a small known test value to verify password correctness.
   * If correct, proceed; else ask again.

4. **Password Storage**
   
   * Store all passwords encrypted with derived key inside IndexedDB.
   * Use a schema like `{id, domain, username, encryptedPassword, metadata}`.

5. **Password Retrieval/Usage**
   
   * Decrypt password on-demand in memory.
   * Use UI to show/fill passwords manually (for now).

---

### Phase 2: Export / Import Vault File

1. **Export Vault**
   
   * Retrieve all encrypted data + salt + metadata from IndexedDB.
   * Bundle into a single encrypted JSON blob file.
   * Add optional custom file header & extension (e.g., `.mypass`).
   * Let user save it locally via Electron’s file dialog.

2. **Import Vault**
   
   * User selects vault file via open dialog.
   * App reads & validates file header & format.
   * Loads encrypted blob + salt + metadata.
   * Saves all data into IndexedDB.
   * On next unlock, user enters master password, key is derived, and vault is unlocked.

---

# 🖼️ Visual Flow Diagram (Conceptual)

```plaintext
 ┌────────────────────┐
 │    App Startup     │
 └────────┬───────────┘
          │
          ▼
 ┌────────────────────┐
 │ Master Password UI │
 └────────┬───────────┘
          │ User inputs master password
          ▼
 ┌────────────────────┐
 │  Key Derivation    │
 │ (KDF with salt)    │
 └────────┬───────────┘
          │
          ▼
 ┌────────────────────┐
 │ Verify key by       │
 │ decrypting test data│
 └────────┬───────────┘
          │ success
          ▼
 ┌────────────────────┐
 │ Vault unlocked     │
 │ (Passwords in DB)  │
 └────────┬───────────┘
          │
          ▼
 ┌─────────────────────────────┐
 │ Use app UI: Add/Edit/Delete  │
 │ passwords (encrypted in DB)  │
 └────────┬────────────────────┘
          │
          │
          │               ┌────────────────────┐
          │ Export vault  │   Import vault     │
          ├──────────────►│ Select file (dialog)│
          │              └────────┬───────────┘
          │                       │
          │                       ▼
          │              ┌─────────────────────┐
          │              │ Parse & validate    │
          │              │ vault file + load   │
          │              │ into IndexedDB      │
          │              └────────┬────────────┘
          │                       │
          └───────────────────────┴───────────────►
                        Ready to unlock vault again
```

---

# Summary

* **Everything lives locally** inside IndexedDB.
* **Master password unlocks vault via key derivation.**
* **Passwords encrypted on disk.**
* **Phase two** adds secure import/export with encrypted vault file.
* No Node server or external database needed.
* Easy to extend later with Electron native dialogs & filesystem access.
