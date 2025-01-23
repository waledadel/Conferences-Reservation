import { Injectable } from '@angular/core';

import { RoomType } from 'app/shared/models/ticket';

@Injectable({
  providedIn: 'root'
})
export class ReservationUtilityService {

  getReservationPrice(roomType: number): number {
    switch (roomType) {
      case RoomType.double:
        return 950;
      case RoomType.triple:
        return 800;
      case RoomType.quad:
        return 700;
      default:
        return 700;
    }
  }
}
