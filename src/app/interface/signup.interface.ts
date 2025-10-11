import { FormControl } from '@angular/forms';

export interface SignupForm {
  name: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}
