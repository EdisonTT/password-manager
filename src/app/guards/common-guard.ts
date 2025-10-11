import { CanActivateFn, Router } from '@angular/router';
import { DbHandler, LoginService, PasswordManager } from '../service';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';

export const dbConnectorGuard: CanActivateFn = () => {
  const dbHandler = inject(DbHandler);
  return dbHandler.init();
};

export const signupGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);
  return login.hasVaultMetadata$.pipe(
    take(1),
    map((flag) => (!flag ? true : router.createUrlTree(['login'])))
  );
};

export const vaultMetaDataGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);
  return login.hasVaultMetadata$.pipe(
    filter((flag) => typeof flag === 'boolean'),
    take(1),
    map((flag) => (flag ? true : router.createUrlTree(['signup'])))
  );
};

export const masterKeyGuard: CanActivateFn = () => {
  const passwordManager = inject(PasswordManager);
  return passwordManager.hasMasterKey()
    ? true
    : inject(Router).createUrlTree(['login']);
};
