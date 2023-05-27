import { NgModule } from '@angular/core';

import { AllSubscriptionComponent } from './all-subscription.component';
import { AllSubscriptionRoutingModule } from './all-subscription-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AdvancedSearchModule } from './../advanced-search/advanced-search.module';
import { ExportMembersModule } from '../export-members/export-members.module';


@NgModule({
  declarations: [
    AllSubscriptionComponent
  ],
  imports: [
    SharedModule,
    AllSubscriptionRoutingModule,
    AdvancedSearchModule,
    ExportMembersModule
  ]
})
export class AllSubscriptionModule { }
