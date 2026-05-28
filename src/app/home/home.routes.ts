import { Routes } from '@angular/router';
import { PasswordList } from './password-list/password-list';
import { Settings } from './settings/settings';

export const HomeRoutes: Routes = [
  {
    path: '',
    component: PasswordList,
  },
  {
    path: 'settings',
    component: Settings,
  }
];
