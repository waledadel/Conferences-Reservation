import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../shared/services/auth.service';
import { FireStoreService } from '@app/services';
import { IUser } from '@app/models';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnDestroy {

  form: FormGroup;
  isPasswordVisible = false;
  isLoading = false;
  destroyed = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fireStoreService: FireStoreService
  ) {
    this.form = this.fb.group({
      email: ['',  [Validators.required, Validators.email]],
      password:  ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  toggleShowPassword(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  login(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.isLoading = true;
      this.fireStoreService.getUserByEmail(formValue.email).pipe(takeUntil(this.destroyed)).subscribe((user: IUser) => {
        if (user) {
          this.authService.login(formValue.email, formValue.password, user.role).then(() => {
            this.isLoading = false;
          }).catch((error) => {
            this.isLoading = false;
          });
        }
      });
    }
  }
}
