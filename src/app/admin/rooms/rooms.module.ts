import { NgModule } from '@angular/core';

import { RoomsRoutingModule } from './rooms-routing.module';
import { RoomsComponent } from './rooms.component';
import { ManageRoomsComponent } from './manage-rooms/manage-rooms.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    RoomsComponent,
    ManageRoomsComponent
  ],
  imports: [
    SharedModule,
    RoomsRoutingModule
  ]
})
export class RoomsModule { }
