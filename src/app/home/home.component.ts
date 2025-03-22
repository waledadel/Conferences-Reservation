import { Constants } from '@app/constants';
import { Component, inject, OnInit } from '@angular/core';

import { ISettings, BookingType } from '@app/models';
import { FireStoreService } from '@app/services';
import { SharedModule } from 'app/shared/shared.module';
import { InfoComponent } from './info/info.component';
import { ReservationComponent } from 'app/admin/reservation/reservation.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [SharedModule, InfoComponent, ReservationComponent]
})
export class HomeComponent implements OnInit {

  readonly bookingType = BookingType;
  settings: ISettings;
  showForm = false;
  currentDate = new Date();
  enableWaitingList = false;
  isReservationStart = false;
  isExpired = false;
  isReservationAllowed = false;
  isWaitingEnabled = false;
  isReservationCompleted = false;
  showInfo = true;

  private readonly fireStoreService = inject(FireStoreService);

  ngOnInit(): void {
    this.fireStoreService.getSingletonDocument<ISettings>(Constants.RealtimeDatabase.settings).subscribe(setting => {
      if (setting) {
        this.settings = setting;
        this.enableWaitingList = setting.enableWaitingList;
        const startReservationDate = this.stripTime(setting.startReservationDate.toDate());
        const endReservationDate = this.stripTime(setting.endReservationDate.toDate());
        const currentDate = this.stripTime(this.currentDate);
        this.isReservationStart = currentDate >= startReservationDate;
        const canReserve = currentDate >= startReservationDate && currentDate <= endReservationDate;
        this.setWaitingSettings();
        this.isReservationAllowed = canReserve || this.isWaitingEnabled;
        this.isExpired = currentDate > endReservationDate;
        this.isReservationCompleted = setting.availableTicketsCount === 0;
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

  private setWaitingSettings(): void {
    const currentDate = this.stripTime(this.currentDate);
    const { startWaitingDate, endWaitingDate } = this.settings;
    if (startWaitingDate && endWaitingDate) {
      const startDate = this.stripTime(startWaitingDate.toDate());
      const endDate = this.stripTime(endWaitingDate.toDate());
      this.isWaitingEnabled = this.enableWaitingList && currentDate >= startDate && currentDate <= endDate;
    } else {
      this.isWaitingEnabled = false;
    }
  }
}
