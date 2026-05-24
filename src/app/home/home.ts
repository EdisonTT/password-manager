import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SideBar } from './side-bar/side-bar';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HomeNotifier, TagFilter } from './service';

@Component({
  selector: 'app-home',
  imports: [SideBar, RouterOutlet],
  providers: [HomeNotifier, TagFilter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  public showNotifier = signal(false);
  public sidebarOpen = signal(false);

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

  public toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  public closeSidebar(): void {
    this.sidebarOpen.set(false);
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
