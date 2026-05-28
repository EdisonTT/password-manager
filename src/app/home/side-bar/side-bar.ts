import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonWrapper } from '../../wrappers';
import { LoginService } from '../../service';
import { Router } from '@angular/router';
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
  public readonly userName = signal<string>('');

  private readonly _destroy$ = new Subject<void>();

  constructor() {
    this._loginService = inject(LoginService);
    this._router = inject(Router);
  }

  ngOnInit(): void {
    this.userName.set(this._loginService.getOwnerName());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }



  public logout() {
    this._loginService.logout();
    this._router.navigate(['login']);
  }
}
