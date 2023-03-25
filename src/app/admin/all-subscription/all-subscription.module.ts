import { NgModule } from '@angular/core';

import { AllSubscriptionComponent } from './all-subscription.component';
import { AllSubscriptionRoutingModule } from './all-subscription-routing.module';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    AllSubscriptionComponent
  ],
  imports: [
    SharedModule,
    AllSubscriptionRoutingModule
  ]
})
export class AllSubscriptionModule { }
