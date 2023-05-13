import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';


import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { ResetPasswordComponent } from './reset-password.component';


@NgModule({
  declarations: [
    ResetPasswordComponent
  ],
  imports: [
    ResetPasswordRoutingModule,
    SharedModule
  ]
})
export class ResetPasswordModule { }
