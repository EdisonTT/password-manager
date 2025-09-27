import { Form, FormControl } from '@angular/forms';

export interface ManagePasswordForm {
  userName: FormControl<string | null>;
  password: FormControl<string | null>;
  domain: FormControl<string | null>;
  tags: FormControl<string | null>;
}
