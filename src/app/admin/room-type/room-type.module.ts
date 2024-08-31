import { NgModule } from '@angular/core';

import { RoomTypeRoutingModule } from './room-type-routing.module';
import { RoomTypeComponent } from './room-type.component';
import { ManageRoomTypeComponent } from './manage-room-type/manage-room-type.component';
import { SharedModule } from 'app/shared/shared.module';


@NgModule({
  declarations: [
    RoomTypeComponent,
    ManageRoomTypeComponent
  ],
  imports: [
    SharedModule,
    RoomTypeRoutingModule
  ]
})
export class RoomTypeModule { }
