import { NgModule } from '@angular/core';

import { DeletedMembersRoutingModule } from './deleted-members-routing.module';
import { DeletedMembersComponent } from './deleted-members.component';
import { SharedModule } from 'app/shared/shared.module';
import { AdvancedSearchModule } from '../advanced-search/advanced-search.module';
import { ExportMembersModule } from '../export-members/export-members.module';


@NgModule({
  declarations: [
    DeletedMembersComponent
  ],
  imports: [
    SharedModule,
    AdvancedSearchModule,
    ExportMembersModule,
    DeletedMembersRoutingModule
  ]
})
export class DeletedMembersModule { }
