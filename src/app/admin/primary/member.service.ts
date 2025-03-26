import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

import { BookingStatus, IAddress, IBus, IPrimaryDataSourceVm, ITicket, IUser } from '@app/models';
import { IAllSubscriptionDataSourceVm, RoomType } from 'app/shared/models/ticket';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  getPrimaryMemberDataSources(members: ITicket[], buses: IBus[], users: IUser[], addresses: IAddress[]): IPrimaryDataSourceVm[] {
    const primaryMembers = members.filter(m => m.isMain);
    const notPrimaryMembers = members.filter(m => !m.isMain);
    return primaryMembers.map(member => ({
      id: member.id,
      name: member.name,
      adultsCount: this.getAdultsCount(member, notPrimaryMembers),
      childrenCount: this.getChildrenCount(member, notPrimaryMembers),
      roomId: member.roomId,
      bookingType: member.bookingType,
      bookingStatus: member.bookingStatus,
      bookingDate: member.bookingDate,
      totalCost: this.getTotalCost(notPrimaryMembers, buses, member),
      paid: member.paid,
      userNotes: member.userNotes,
      transportationId: member.transportationId,
      primaryId: member.primaryId,
      mobile: member.mobile,
      transportationName: this.getBusNameById(member.transportationId, buses),
      gender: member.gender,
      birthDate: member.birthDate,
      age: this.getAge(member.birthDate),
      birthDateMonth: member.birthDate.toDate().getMonth() + 1,
      adminNotes: member.adminNotes,
      lastUpdateUserId: member.lastUpdateUserId ?? '',
      lastUpdateDate: member.lastUpdateDate,
      lastUpdatedBy: this.getUserById(member.lastUpdateUserId, users),
      addressId: member.addressId,
      addressName: this.getAddressNameById(member.addressId, addresses),
      mainMemberName: '',
      remaining: 0,
      roomType: member.roomType
    }));
  }

  getAllMembersDataSource(members: ITicket[], buses: IBus[]): IAllSubscriptionDataSourceVm[] {
    const notPrimaryMembers = members.filter(m => !m.isMain);
    const membersMap = new Map(members.map(member => [member.id, member]));
    return members.map(member => {
      const primaryMember = membersMap.get(member.primaryId);
      return {
        id: member.id,
        isMain: member.isMain,
        name: member.name,
        mainMemberName: member.isMain ? 'ذاته' : primaryMember?.name ?? '',
        roomId: member.roomId,
        bookingStatus: this.getBookingStatus(member, members),
        totalCost:  member.isMain ? this.getTotalCost(notPrimaryMembers, buses, member) : this.getTotalCost(notPrimaryMembers, buses, members.find(m => m.id === member.primaryId)),
        paid: member.isMain ? member.paid : primaryMember?.paid ?? 0,
        transportationId: member.transportationId,
        primaryId: member.primaryId,
        mobile: member.mobile,
        transportationName: member.isMain ? this.getBusNameById(member.transportationId, buses) : 
          this.getBusNameById(primaryMember?.transportationId ?? '', buses),
        gender: member.gender,
        birthDate: member.birthDate,
        age: this.getAge(member.birthDate),
        address: '',
        birthDateMonth: member.birthDate.toDate().getMonth() + 1,
        addressId: member.addressId,
        displayedRoomName: '',
        remaining: 0,
        roomType: this.getRoomType(member, members),
        adminNotes: member.adminNotes,
        userNotes: member.userNotes,
        bookingType: member.bookingType,
        bookingDate: member.bookingDate
      };
    });
  }

  getAddressNameById(id: string, addresses: IAddress[]): string {
    if (id && addresses.length > 0) {
      const address = addresses.find(b => b.id === id);
      if (address) {
        return address.name;
      }
      return '';
    }
    return '';
  }

  private getAge(birthDate: Timestamp): number {
    return new Date().getFullYear() - birthDate.toDate().getFullYear();
  }

  private getTotalCost(list: ITicket[], buses: IBus[], ticket?: ITicket): number {
    if (ticket && (ticket.bookingStatus === BookingStatus.new || ticket.bookingStatus === BookingStatus.confirmed || ticket.bookingStatus === BookingStatus.waiting)) {
      let adultCost = 0;
      let primaryCost = 0;
      let childrenCost = 0;
      const price = this.getReservationPrice(ticket.roomType);
      primaryCost = this.getTransportPrice(ticket.transportationId, buses) + price;
      const members = list.filter(c => c.primaryId === ticket.id);
      if (list.length > 0) {
        const adults = members.filter(c => new Date().getFullYear() - c.birthDate.toDate().getFullYear() >= 8);
        if (adults && adults.length > 0) {
          adults.forEach(adult => {
            const transportPrice = this.getTransportPrice(adult.transportationId, buses);
            adultCost += (transportPrice + price);
          });
        }
        const childrenBetweenFourAndEight = members.filter(c => new Date().getFullYear() - c.birthDate.toDate().getFullYear() > 4
          && new Date().getFullYear() - c.birthDate.toDate().getFullYear() < 8);
        if (childrenBetweenFourAndEight && childrenBetweenFourAndEight.length > 0) {
          childrenBetweenFourAndEight.forEach((adult) => {
            const transportPrice = this.getTransportPrice(adult.transportationId, buses);
            childrenCost += ((0.5 * price) + transportPrice);
          });
        }
      }
      return primaryCost + adultCost + childrenCost;
    }
    return 0;
  }

  private getReservationPrice(roomType: number): number {
    switch (roomType) {
      case RoomType.double:
        return 950;
      case RoomType.triple:
        return 850;
      case RoomType.quad:
        return 700;
      default:
        return 700;
    }
  }

  private getTransportPrice(transportId: string, buses: IBus[]): number {
    if (transportId && buses.length > 0) {
      const bus = buses.find(b => b.id === transportId);
      if (bus) {
        return +bus.price;
      }
      return 0;
    }
    return 0;
  }

  private getBusNameById(id: string, buses: IBus[]): string {
    if (id && buses.length > 0) {
      const bus = buses.find(b => b.id === id);
      if (bus) {
        return bus.name;
      }
      return '';
    }
    return '';
  }

  private getAdultsCount(member: ITicket, list: ITicket[]): number {
    if (member && list.length > 0) {
      const adults = list.filter(m => m.primaryId === member.primaryId &&
        new Date().getFullYear() - m.birthDate.toDate().getFullYear() >= 8);
      return adults ? adults.length : 0;
    }
    return 0;
  }

  private getChildrenCount(member: ITicket, list: ITicket[]): number {
    const children = list.filter(m => m.primaryId === member.primaryId &&
      new Date().getFullYear() - m.birthDate.toDate().getFullYear() < 8);
    return children ? children.length : 0;
  }

  private getUserById(id: string, users: IUser[]): string {
    if (id && users.length > 0) {
      const user = users.find(u => u.id === id);
      if (user) {
        return user.fullName;
      }
      return '';
    }
    return '';
  }

  private getBookingStatus(member: ITicket, members: ITicket[]): BookingStatus {
    if (member.isMain) {
      return member.bookingStatus;
    }
    const mainMembersMap = new Map(members.filter(m => m.isMain).map(m => [m.id, m.bookingStatus]));
    return mainMembersMap.get(member.primaryId) ?? BookingStatus.all;
  }

  private getRoomType(member: ITicket, members: ITicket[]): RoomType {
    if (member.isMain) {
      return member.roomType;
    }
    const mainMembersMap = new Map(members.filter(m => m.isMain).map(m => [m.id, m.roomType]));
    return mainMembersMap.get(member.primaryId) ?? RoomType.single;
  }
}
