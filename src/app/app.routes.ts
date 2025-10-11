import { Routes } from '@angular/router';
import { HomeRoutes, Home } from './home';
import { LoginPage } from './login-page/login-page';
import { dbConnectorGuard } from './guards';
import { Signup } from './signup/signup';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [dbConnectorGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => Promise.resolve(Home),
        children: HomeRoutes,
      },
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'signup',
        component: Signup,
      },
    ],
  },
];
