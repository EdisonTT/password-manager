import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { DbHandler } from '../../service';

/** Special filter values that aren't real tags */
export const TAG_ALL = '__ALL__';
export const TAG_UNTAGGED = '__UNTAGGED__';

@Injectable()
export class TagFilter {
  private readonly _dbHandler: DbHandler;

  /** Currently selected tag filter. Defaults to showing all. */
  private readonly _activeTag = new BehaviorSubject<string>(TAG_ALL);
  public get activeTag$() {
    return this._activeTag.asObservable();
  }
  public get activeTag(): string {
    return this._activeTag.getValue();
  }

  /** Unique tags derived from all entries in memory */
  public readonly tags$: Observable<string[]>;

  constructor() {
    this._dbHandler = inject(DbHandler);
    this.tags$ = this._dbHandler.entries$.pipe(
      map((entries) => {
        const tagSet = new Set<string>();
        for (const entry of entries) {
          if (entry.tags && entry.tags.length > 0) {
            for (const tag of entry.tags) {
              tagSet.add(tag);
            }
          }
        }
        return Array.from(tagSet).sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
      })
    );
  }

  public selectTag(tag: string): void {
    this._activeTag.next(tag);
  }
}
