import { NgModule } from '@angular/core';

import { AllSubscriptionComponent } from './all-subscription.component';
import { AllSubscriptionRoutingModule } from './all-subscription-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AdvancedSearchModule } from './../advanced-search/advanced-search.module';
import { ExportMembersModule } from '../export-members/export-members.module';
import { AddRoomToMemberComponent } from './add-room-to-member/add-room-to-member.component';
import { RoomCancellationComponent } from './room-cancellation/room-cancellation.component';


@NgModule({
  declarations: [
    AllSubscriptionComponent,
    AddRoomToMemberComponent,
    RoomCancellationComponent
  ],
  imports: [
    SharedModule,
    AllSubscriptionRoutingModule,
    AdvancedSearchModule,
    ExportMembersModule
  ]
})
export class AllSubscriptionModule { }
