import { Routes } from '@angular/router';
import { HomeRoutes, Home } from './home';
import { LoginPage } from './login-page/login-page';
import { dbConnectorGuard, masterKeyGuard, vaultMetaDataGuard } from './guards';
import { Signup } from './signup/signup';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'vault',
    pathMatch: 'full',
  },
  {
    path: 'signup',
    component: Signup,
  },
  {
    path: '',
    canActivate: [dbConnectorGuard],
    children: [
      {
        path: 'vault',
        loadComponent: () => Promise.resolve(Home),
        canActivate: [masterKeyGuard],
        children: HomeRoutes,
      },
      {
        path: 'login',
        component: LoginPage,
        canActivate: [vaultMetaDataGuard],
      },
    ],
  },
];
