import { Component } from '@angular/core';

import { TicketType } from '@app/models';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  selectedTabIndex = 0;

  ticketType = TicketType;

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

}
