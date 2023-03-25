import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { EmptyDataComponent } from './components/empty-data/empty-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LogoutComponent } from './components/logout/logout.component';
import { MaterialModule } from './material/material.module';


const components = [
  EmptyDataComponent,
  ConfirmDeleteComponent,
  PageNotFoundComponent,
  LogoutComponent
];

const modules = [
  ReactiveFormsModule,
  FormsModule,
  CommonModule,
  TranslateModule,
  MaterialModule
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
