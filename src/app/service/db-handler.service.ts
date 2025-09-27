import { inject, Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  defer,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { VaultEntry } from '../interface';
import { DbHelper } from './db-helper.service';
import { DB_NAME, DB_VERSION, STORE_ENTRIES } from '../const';

@Injectable({
  providedIn: 'root',
})
export class DbHandler {
  private readonly _dbHelperService: DbHelper;

  private _db?: IDBPDatabase;
  private _initiated = false;

  private readonly _entriesSubject = new BehaviorSubject<VaultEntry[]>([]);
  public get entries$() {
    return this._entriesSubject.asObservable();
  }

  constructor() {
    this._dbHelperService = inject(DbHelper);
  }

  /**
   * Initialize DB. Returns Observable<void>.
   * Call once on app start/login. Safe to call multiple times.
   */
  public init(): Observable<boolean> {
    if (this._initiated) return of(false);

    // defer ensures the openDB is executed when subscribed
    return defer(() =>
      from(
        openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
              db.createObjectStore(STORE_ENTRIES, {
                keyPath: 'id',
                autoIncrement: true,
              });
            }
          },
        })
      )
    ).pipe(
      tap((opened: IDBPDatabase) => {
        this._db = opened;
      }),
      // load all entries into memory
      switchMap(() => this.loadAllToMemory()),
      tap(() => {
        this._initiated = true;
        console.log('DB initialized');
      }),
      map(() => true)
    );
  }

  /** Internal: load all entries from IDB into BehaviorSubject */
  private loadAllToMemory(): Observable<void> {
    if (!this._db) return throwError(() => new Error('DB not initialized'));
    return defer(() => from(this._db!.getAll(STORE_ENTRIES))).pipe(
      map((items: any[]) =>
        items.map(
          (it) =>
            ({
              ...it,
              ciphertext: this._dbHelperService.normalizeToUint8(it.ciphertext),
              iv: this._dbHelperService.normalizeToUint8(it.iv),
            } as VaultEntry)
        )
      ),
      tap((arr: VaultEntry[]) => this._entriesSubject.next(arr)),
      map(() => undefined),
      catchError((err) => {
        console.error('Error loading entries from DB', err);
        return throwError(() => err);
      })
    );
  }

  /** Add entry. Returns Observable<VaultEntry> with assigned id. */
  public addEntry(
    entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<VaultEntry> {
    if (!this._db) return throwError(() => new Error('DB not initialized'));

    const toInsert: VaultEntry = { ...entry, createdAt: Date.now() };

    return defer(() =>
      from(this._db!.add(STORE_ENTRIES, toInsert as any))
    ).pipe(
      map((id: any) => ({ ...toInsert, id } as VaultEntry)),
      tap((stored) => {
        const current = this._entriesSubject.getValue();
        this._entriesSubject.next([...current, stored]);
      }),
      map((stored) => this._dbHelperService.cloneEntry(stored))
    );
  }

  /** Update entry. Returns Observable<VaultEntry> of updated record. */
  public updateEntry(
    id: number,
    patch: Partial<VaultEntry>
  ): Observable<VaultEntry> {
    if (!this._db) return throwError(() => new Error('DB not initialized'));

    return defer(() => from(this._db!.get(STORE_ENTRIES, id))).pipe(
      concatMap((existing) => {
        if (!existing) return throwError(() => new Error('Entry not found'));
        const merged = { ...existing, ...patch, updatedAt: Date.now() };
        return defer(() => from(this._db!.put(STORE_ENTRIES, merged))).pipe(
          map(() => merged as VaultEntry),
          tap((mergedEntry) => {
            const normalized = {
              ...mergedEntry,
              ciphertext: this._dbHelperService.normalizeToUint8(
                mergedEntry.ciphertext
              ),
              iv: this._dbHelperService.normalizeToUint8(mergedEntry.iv),
            } as VaultEntry;
            const current = this._entriesSubject.getValue();
            const updatedArr = current.map((e) =>
              e.id === id ? normalized : e
            );
            this._entriesSubject.next(updatedArr);
          }),
          map((m: any) =>
            this._dbHelperService.cloneEntry({
              ...m,
              ciphertext: this._dbHelperService.normalizeToUint8(m.ciphertext),
              iv: this._dbHelperService.normalizeToUint8(m.iv),
            })
          )
        );
      })
    );
  }

  /** Delete entry. Returns Observable<void> */
  public deleteEntry(id: number): Observable<void> {
    if (!this._db) return throwError(() => new Error('DB not initialized'));
    return defer(() => from(this._db!.delete(STORE_ENTRIES, id))).pipe(
      tap(() => {
        const current = this._entriesSubject.getValue();
        this._entriesSubject.next(current.filter((e) => e.id !== id));
      }),
      map(() => undefined)
    );
  }

  /** Clear all data (danger). Returns Observable<void> */
  public clearAll(): Observable<void> {
    if (!this._db) return throwError(() => new Error('DB not initialized'));
    return defer(() => from(this._db!.clear(STORE_ENTRIES))).pipe(
      tap(() => this._entriesSubject.next([])),
      map(() => undefined)
    );
  }

  close(): Observable<void> {
    if (!this._db) return of(undefined);
    return defer(() => {
      this._db!.close();
      this._db = undefined;
      this._initiated = false;
      this._entriesSubject.next([]);
      return Promise.resolve(undefined);
    });
  }
}
