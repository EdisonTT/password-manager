import { Injectable } from '@angular/core';
import {
  ERROR_MESSAGE,
  ErrorFromControl,
  ErrorMessageItem,
  ErrorName,
} from '../wrappers';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormHelper {
  private submissionNotifier = new Subject<boolean>();

  constructor() {}

  public updateNotifySubmission(flag: boolean) {
    this.submissionNotifier.next(flag);
  }

  public get submissionNotifier$() {
    return this.submissionNotifier.asObservable();
  }

  public getErrorMessage(errors: ErrorFromControl): string | null {
    if (!errors) return null;
    const errorArray = Object.keys(errors) as ErrorName[];
    if (!errorArray.length) return null;
    const errorResults: ErrorMessageItem[] = [];
    errorArray.forEach((error) => {
      if (error in ERROR_MESSAGE) {
        errorResults.push(ERROR_MESSAGE[error]);
      }
    });

    errorResults.sort((a, b) => {
      return a.priority - b.priority;
    });
    return errorResults[0]?.message || null;
  }
}
