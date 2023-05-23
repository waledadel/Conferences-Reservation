import { NgModule } from '@angular/core';

import { AllSubscriptionComponent } from './all-subscription.component';
import { AllSubscriptionRoutingModule } from './all-subscription-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AdvancedSearchModule } from './../advanced-search/advanced-search.module';


@NgModule({
  declarations: [
    AllSubscriptionComponent
  ],
  imports: [
    SharedModule,
    AllSubscriptionRoutingModule,
    AdvancedSearchModule
  ]
})
export class AllSubscriptionModule { }
