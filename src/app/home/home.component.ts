import { Constants } from '@app/constants';
import { Component, OnInit } from '@angular/core';

import { ISettings, TicketType } from '@app/models';
import { FireStoreService } from '@app/services';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  selectedTabIndex = 0;
  ticketType = TicketType;
  settings: Observable<Array<ISettings>>;
  showForm = false;

  constructor(private fireStoreService: FireStoreService) {
    this.settings = {} as Observable<Array<ISettings>>;
  }

  ngOnInit(): void {
    this.settings = this.fireStoreService.getAll(Constants.RealtimeDatabase.settings);
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  showTicketForm(show: boolean): void {
    this.showForm = show;
  }

}
