import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { EmptyDataComponent } from './components/empty-data/empty-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { MaterialModule } from './material/material.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LogoutComponent } from './logout/logout.component';


const components = [
  EmptyDataComponent,
  ConfirmDeleteComponent,
  PageNotFoundComponent,
  LogoutComponent
];

const modules = [
  MaterialModule,
  ReactiveFormsModule,
  FormsModule,
  CommonModule,
  TranslateModule
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [
    ...components,
    ...modules
  ]
})
export class SharedModule { }
