import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AllSubscriptionComponent } from './all-subscription.component';

const routes: Routes = [
  {
    path: '',
    component: AllSubscriptionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllSubscriptionRoutingModule { }
