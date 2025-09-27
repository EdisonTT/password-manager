import { CanActivateFn } from '@angular/router';
import { DbHandler } from '../service';
import { inject } from '@angular/core';

export const dbConnectorGuard: CanActivateFn = () => {
  const dbHandler = inject(DbHandler);
  return dbHandler.init();
};
