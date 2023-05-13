import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Constants } from '@app/constants';
import { AuthService } from '@app/services';

@Component({
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      email: ['',  [Validators.required, Validators.email]]
    });
  }

  async resetPassword(): Promise<void> {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.resetPassword(this.form.value.email).then(() => {
        this.form.reset();
        this.router.navigateByUrl(`${Constants.Routes.login}`);
        this.isLoading = false;
      });
    }
  }
}
