import { FormControl } from '@angular/forms';
import { FormRawValue, VaultEntry } from '../../../interface';

export interface ManagePasswordForm {
  title: FormControl<string | null>;
  userName: FormControl<string | null>;
  password: FormControl<string | null>;
  domain: FormControl<string | null>;
  tags: FormControl<string | null>;
}

export type ManagePasswordFormRaw = FormRawValue<ManagePasswordForm>;
export interface ManagePasswordFormRawAfterValidation {
  title: string;
  userName: string;
  password: string;
  domain: string | null;
  tags: string | null;
}

export type PasswordData = {
  id?: number;
  uuid?: string;
  title: string;
  userName: string;
  password: string;
  domain?: string;
  tags?: string;
};
