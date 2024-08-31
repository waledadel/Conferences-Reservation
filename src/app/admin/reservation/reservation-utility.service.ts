import { Injectable } from '@angular/core';
// import { IAllSubscriptionDataSourceVm } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class ReservationUtilityService {

  constructor() { }

  // getTotalCost(ticket: IAllSubscriptionDataSourceVm, list: Array<IAllSubscriptionDataSourceVm>): number {
  //   if (ticket && list && list.length > 0) {
  //     let childrenCost = 0;
  //     let adultCost = 0;
  //     let primaryCost = 0;
  //     const primaryMember = list.find(m => m.id === ticket.primaryId && m.isMain);
  //     if (primaryMember) {
  //       primaryCost = this.model.adultReservationPrice + this.getTransportPrice(primaryMember.transportationId);
  //       const children = list.filter(m => m.primaryId === primaryMember.id && m.isChild);
  //       const adults = list.filter(m => m.primaryId === primaryMember.id && !m.isChild && !m.isMain);
  //       if (children && children.length > 0) {
  //         children.forEach(child => {
  //           const reservationPrice = this.getChildReservationPrice(child.birthDate);
  //           const bedPrice = this.getChildBedPrice(child);
  //           const transportPrice = this.getTransportPrice(child.transportationId);
  //           childrenCost += (reservationPrice + bedPrice + transportPrice);
  //         });
  //       }
  //       if (adults && adults.length > 0) {
  //         adults.forEach(adult => {
  //           const price = this.model.adultReservationPrice;
  //           const transportPrice = this.getTransportPrice(adult.transportationId);
  //           adultCost += price + transportPrice;
  //         });
  //       }
  //       return primaryCost + adultCost + childrenCost;
  //     }
  //     return 0;
  //   }
  //   return 0;
  // }

  // private getPrice(ticket: IPrimaryDataSourceVm): number {
  //   const isGroup = ticket.bookingType === BookingType.group;
  //   if (isGroup && ticket.roomType === RoomType.double) {
  //     return 1050;
  //   } else if (isGroup && ticket.roomType === RoomType.triple) {
  //     return 950;
  //   } else if (isGroup && ticket.roomType === RoomType.quad) {
  //     return 800;
  //   } else if(ticket.bookingType === BookingType.individual) {
  //     return 800;
  //   } else {
  //     return 0;
  //   }
  // }
}
