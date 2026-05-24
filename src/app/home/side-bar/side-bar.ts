import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonWrapper } from '../../wrappers';
import { LoginService } from '../../service';
import { Router } from '@angular/router';
import { TagFilter, TAG_ALL, TAG_UNTAGGED } from '../service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'side-bar',
  imports: [ButtonWrapper],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar implements OnInit, OnDestroy {
  private readonly _loginService: LoginService;
  private readonly _router: Router;
  private readonly _tagFilter: TagFilter;

  public readonly userName = signal<string>('');
  public readonly tags = signal<string[]>([]);
  public readonly activeTag = signal<string>(TAG_ALL);
  public readonly TAG_ALL = TAG_ALL;
  public readonly TAG_UNTAGGED = TAG_UNTAGGED;

  private readonly _destroy$ = new Subject<void>();

  constructor() {
    this._loginService = inject(LoginService);
    this._router = inject(Router);
    this._tagFilter = inject(TagFilter);
  }

  ngOnInit(): void {
    this.userName.set(this._loginService.getOwnerName());

    this._tagFilter.tags$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tags) => {
        this.tags.set(tags);
      });

    this._tagFilter.activeTag$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tag) => {
        this.activeTag.set(tag);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public selectTag(tag: string) {
    this._tagFilter.selectTag(tag);
  }

  public logout() {
    this._loginService.logout();
    this._router.navigate(['login']);
  }
}
