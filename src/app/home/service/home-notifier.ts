import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class HomeNotifier {
  constructor() {}

  private _showNotifier = new Subject<boolean>();
  public get showNotifier$() {
    return this._showNotifier.asObservable();
  }
  public showNotifier() {
    this._showNotifier.next(true);
  }
}
