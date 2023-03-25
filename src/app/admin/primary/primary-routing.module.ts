import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrimaryComponent } from './primary.component';

const routes: Routes = [
  {
    path: '',
    component: PrimaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrimaryRoutingModule { }
