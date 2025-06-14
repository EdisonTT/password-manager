import { Routes } from '@angular/router';
import { PasswordList } from './password-list/password-list';

export const HomeRoutes: Routes = [
  {
    path: '',
    component: PasswordList,
  },
];
