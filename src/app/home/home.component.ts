import { Constants } from '@app/constants';
import { Component, OnInit } from '@angular/core';

import { ISettings, BookingType } from '@app/models';
import { FireStoreService } from '@app/services';
import { Observable } from 'rxjs';
import { SharedModule } from 'app/shared/shared.module';
import { InfoComponent } from './info/info.component';
import { ReservationComponent } from 'app/admin/reservation/reservation.component';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [SharedModule, InfoComponent, ReservationComponent]
})
export class HomeComponent implements OnInit {

  bookingType = BookingType;
  settings: Observable<Array<ISettings>>;
  showForm = false;
  currentDate = new Date();
  enableWaitingList = false;
  isReservationStart = false;
  isExpired = false;
  isReservationAllowed = false;
  isWaitingEnabled = false;
  isReservationCompleted = false;
  showInfo = true;

  constructor(private fireStoreService: FireStoreService) {
    this.settings = {} as Observable<Array<ISettings>>;
  }

  ngOnInit(): void {
    this.settings = this.fireStoreService.getAll(Constants.RealtimeDatabase.settings);
    this.settings.subscribe(res => {
      if (res?.length > 0) {
        this.enableWaitingList = res[0].enableWaitingList;
        const startReservationDate = this.stripTime(res[0].startReservationDate.toDate());
        const endReservationDate = this.stripTime(res[0].endReservationDate.toDate());
        const startWaitingDate = this.stripTime(res[0].startReservationDate.toDate());
        const endWaitingDate = this.stripTime(res[0].endWaitingDate.toDate());
        const currentDate = this.stripTime(this.currentDate);
        this.isReservationStart = currentDate >= startReservationDate;
        this.isWaitingEnabled = this.enableWaitingList && currentDate >= startWaitingDate && currentDate <= endWaitingDate;
        const canReserve = currentDate >= startReservationDate && currentDate <= endReservationDate;
        this.isReservationAllowed = canReserve || this.isWaitingEnabled;
        this.isExpired = currentDate > endReservationDate;
        this.isReservationCompleted = res[0].availableTicketsCount === 0;
      }
    });
  }

  bookingSuccessfully(): void {
    this.showForm = false;
    this.showInfo = true;
  }

  showTicketForm(show: boolean): void {
    this.showInfo = !show;
    this.showForm = show;
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
