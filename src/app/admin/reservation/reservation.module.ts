import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ReservationComponent } from './reservation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ManageReservationComponent } from './manage-reservation/manage-reservation.component';
import { MatDialogModule } from '@angular/material/dialog';


const components = [
  ReservationComponent,
  ManageReservationComponent
];

const modules = [
  CommonModule,
  TranslateModule,
  ReactiveFormsModule,
  FormsModule,
  MatIconModule,
  MatFormFieldModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRippleModule,
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule
];


@NgModule({
  declarations: components,
  exports: [
    ...modules,
    ...components
  ],
  imports: modules
})
export class ReservationModule { }
