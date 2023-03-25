import { NgModule } from '@angular/core';
import { NgxEditorModule } from 'ngx-editor';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    NgxEditorModule,
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
