import { NgModule } from '@angular/core';

import { AddressRoutingModule } from './address-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AddressComponent } from './address.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';


@NgModule({
  declarations: [
    AddressComponent,
    ManageAddressComponent
  ],
  imports: [
    SharedModule,
    AddressRoutingModule
  ]
})
export class AddressModule { }
