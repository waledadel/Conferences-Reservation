import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ReservationModel } from './reservation.models';
import { ITicket } from '@app/models';
import { MatTabGroup } from '@angular/material/tabs';
import { RoomType } from 'app/shared/models/ticket';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html'
})
export class ReservationComponent {

  @Input() isAdmin = false;
  @Input() isEditMode = false;
  @Input() isWaitingEnabled = false;
  @Input() reservationData: Array<ITicket> = [];
  @Output() bookingDone = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('tabs') tabs!: MatTabGroup;
  model: ReservationModel;

  constructor() {
    this.model = new ReservationModel();
  }

  onTabChanged(tabIndex: number): void {
    // Tabs are 0 based index
    this.setGroupTabBasedOnRoomType(tabIndex + 1);
  }

  setGroupTabBasedOnRoomType(roomType: RoomType): void {
    switch (roomType) {
      case RoomType.double:
        this.setIsDouble();
        break;
      case RoomType.triple:
        this.setIsTriple();
        break;
      case RoomType.quad:
        this.setIsQuad();
        break;
      default:
        this.setIsIndividual();
        break;
    }
  }

  private setIsIndividual(): void {
    this.tabs.selectedIndex = 0;
    this.model.isIndividual = true;
    this.model.isDouble = false;
    this.model.isTriple = false;
    this.model.isQuad = false;
  }

  private setIsDouble(): void {
    this.tabs.selectedIndex = 1;
    this.model.isIndividual = false;
    this.model.isDouble = true;
    this.model.isTriple = false;
    this.model.isQuad = false;
  }

  private setIsTriple(): void {
    this.tabs.selectedIndex = 2;
    this.model.isIndividual = false;
    this.model.isDouble = false;
    this.model.isTriple = true;
    this.model.isQuad = false;
  }

  private setIsQuad(): void {
    this.tabs.selectedIndex = 3;
    this.model.isIndividual = false;
    this.model.isDouble = false;
    this.model.isTriple = false;
    this.model.isQuad = true;
  }
}
