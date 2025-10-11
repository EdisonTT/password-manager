import { Routes } from '@angular/router';
import { HomeRoutes, Home, HomeNotifier } from './home';
import { LoginPage } from './login-page/login-page';
import {
  dbConnectorGuard,
  masterKeyGuard,
  signupGuard,
  vaultMetaDataGuard,
} from './guards';
import { Signup } from './signup/signup';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'vault',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [dbConnectorGuard],
    children: [
      {
        path: 'vault',
        loadComponent: () => Promise.resolve(Home),
        canActivate: [masterKeyGuard],
        providers: [HomeNotifier],
        children: HomeRoutes,
      },
      {
        path: 'login',
        component: LoginPage,
        canActivate: [vaultMetaDataGuard],
      },
      {
        path: 'signup',
        component: Signup,
        canActivate: [signupGuard],
      },
    ],
  },
];
