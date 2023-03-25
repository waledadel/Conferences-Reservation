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
  isReservationStart = false;
  isReservationEnd = false;

  constructor(private fireStoreService: FireStoreService) {
    this.settings = {} as Observable<Array<ISettings>>;
  }
  
  ngOnInit(): void {
    this.settings = this.fireStoreService.getAll(Constants.RealtimeDatabase.settings);
    this.settings.subscribe(res => {
      this.isReservationStart = this.currentDate > res[0].startReservationDate.toDate() ;
      this.isReservationEnd = this.currentDate > res[0].endReservationDate.toDate();
    });
  }

  onTabChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  showTicketForm(show: boolean): void {
    this.showForm = show;
  }

}
