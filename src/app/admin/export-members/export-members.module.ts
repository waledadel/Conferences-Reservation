import { NgModule } from '@angular/core';

import { ExportMembersComponent } from './export-members.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    ExportMembersComponent
  ],
  exports: [
    ExportMembersComponent
  ],
  imports: [
    SharedModule
  ]
})
export class ExportMembersModule { }
