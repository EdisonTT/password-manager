import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SideBar } from './side-bar/side-bar';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HomeNotifier } from './service';

@Component({
  selector: 'app-home',
  imports: [SideBar, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  public showNotifier = signal(false);

  private _destroy$ = new Subject<void>();
  private readonly _homeNotifier: HomeNotifier;

  constructor() {
    this._homeNotifier = inject(HomeNotifier);
  }

  ngOnInit(): void {
    this.subForNotifier();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private subForNotifier() {
    // simple implementation of notifier
    // fails if multiple copy happens in 2 seconds
    this._homeNotifier.showNotifier$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.showNotifier.set(true);
        setTimeout(() => {
          this.showNotifier.set(false);
        }, 2000);
      });
  }
}
