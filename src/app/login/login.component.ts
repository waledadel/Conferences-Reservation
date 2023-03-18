import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../shared/services/auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form: FormGroup;
  isPasswordVisible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['',  [Validators.required, Validators.email]],
      password:  ['', Validators.required]
    });
  }

  toggleShowPassword(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  login(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.isLoading = true;
      this.authService.login(formValue.email, formValue.password).then(() => {
      }).catch((error) => {
        this.isLoading = false;
      });
    }
  }
}
