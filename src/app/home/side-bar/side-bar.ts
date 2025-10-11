import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonWrapper } from '../../wrappers';
import { LoginService } from '../../service';
import { Router } from '@angular/router';

@Component({
  selector: 'side-bar',
  imports: [ButtonWrapper],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar implements OnInit {
  private readonly _loginService: LoginService;
  private readonly _router: Router;

  public readonly userName = signal<string>('');

  constructor() {
    this._loginService = inject(LoginService);
    this._router = inject(Router);
  }

  ngOnInit(): void {
    this.userName.set(this._loginService.getOwnerName());
  }

  public logout() {
    this._loginService.logout();
    this._router.navigate(['login']);
  }
}
