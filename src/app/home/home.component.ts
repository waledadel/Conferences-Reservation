import { Constants } from '@app/constants';
import { Component, OnInit } from '@angular/core';

import { ISettings, BookingType } from '@app/models';
import { FireStoreService } from '@app/services';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  selectedTabIndex = 0;
  bookingType = BookingType;
  settings: Observable<Array<ISettings>>;
  showForm = false;
  currentDate = new Date();
  enableWaitingList = false;
  isReservationStart = false;

  constructor(private fireStoreService: FireStoreService) {
    this.settings = {} as Observable<Array<ISettings>>;
  }
  
  ngOnInit(): void {
    this.settings = this.fireStoreService.getAll(Constants.RealtimeDatabase.settings);
    this.settings.subscribe(res => {
      this.enableWaitingList = res[0].enableWaitingList;
      this.isReservationStart = this.currentDate > res[0].startReservationDate.toDate() ;
    });
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  showTicketForm(show: boolean): void {
    this.showForm = show;
  }

}
