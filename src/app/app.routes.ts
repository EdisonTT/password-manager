import { Routes } from '@angular/router';
import { HomeRoutes, Home } from './home';
import { LoginPage } from './login-page/login-page';
import { dbConnectorGuard } from './guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
    canActivate: [dbConnectorGuard],
    children: HomeRoutes,
  },
  {
    path: 'login',
    component: LoginPage,
  },
];
