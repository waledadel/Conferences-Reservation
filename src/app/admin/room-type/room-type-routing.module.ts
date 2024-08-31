import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoomTypeComponent } from './room-type.component';

const routes: Routes = [
  {
    path: '',
    component: RoomTypeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomTypeRoutingModule { }
