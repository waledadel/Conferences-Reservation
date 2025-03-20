import { Component, OnInit } from '@angular/core';

import { AdminService } from '../admin.service';
import { FireStoreService } from '@app/services';
import { Gender, IBus } from '@app/models';
import { Constants } from '@app/constants';
import { ICost, StatisticsModel } from './statistics.models';
import { BookingStatus, IAllSubscriptionDataSourceVm, RoomType } from 'app/shared/models/ticket';
import { ReservationUtilityService } from 'app/utils/reservation-utility.service';

@Component({
    templateUrl: './statistics.component.html',
    standalone: false
})
export class StatisticsComponent implements OnInit {

  model: StatisticsModel;

  constructor(private adminService: AdminService, private fireStoreService: FireStoreService, private reservationUtilityService: ReservationUtilityService) { }

  ngOnInit(): void {
    this.adminService.updatePageTitle('الإحصائيات');
    this.initModel();
    this.getBuses();
    this.getAllMembers();
  }

  private initModel(): void {
    this.model = new StatisticsModel();
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.buses = data;
    });
  }

  private getAllMembers(): void {
    this.fireStoreService.getAllMembers().subscribe(res => {
      const allowedBookingStatus = [BookingStatus.new, BookingStatus.confirmed];
      const cancelledBookingStatus = [BookingStatus.canceled, BookingStatus.deleted];
      const allMembers = res.filter(m => (m.isMain && allowedBookingStatus.includes(m.bookingStatus)) || !m.isMain);
      const cancelledMembers = res.filter(m => cancelledBookingStatus.includes(m.bookingStatus) && m.isMain);
      const busStatistics = [
        { key: 'statistics.shoubraBusCount', busName: 'شبرا' },
        { key: 'statistics.misrBusCount', busName: 'مصر' }
      ];
      busStatistics.forEach(({ key, busName }) => {
        const bus = this.model.buses.find(m => m.name.includes(busName));
        if (bus) {
          const members = allMembers.filter(m => m.transportationId === bus.id);
          this.addStatistics(key, this.sortedAllMembers(members));
        }
      });
      const ageGenderStatistics = [
        { key: 'statistics.childrenBoysCountFromFourToEight', minAge: 4, maxAge: 8, gender: Gender.male},
        { key: 'statistics.childrenGirlsCountFromFourToEight', minAge: 4, maxAge: 8, gender: Gender.female},
        { key: 'statistics.childrenBoysCountFromEightToTen', minAge: 8, maxAge: 10, gender: Gender.male},
        { key: 'statistics.childrenGirlsCountFromEightToTen', minAge: 8, maxAge: 10, gender: Gender.female},
        { key: 'statistics.childrenBoysCountFromTenToTwelve', minAge: 10, maxAge: 12, gender: Gender.male},
        { key: 'statistics.childrenGirlsCountFromTenToTwelve', minAge: 10, maxAge: 12, gender: Gender.female},
        { key: 'statistics.youthBoysCountFromTewlveToEighteen', minAge: 12, maxAge: 18, gender: Gender.male},
        { key: 'statistics.youthGirlsCountFromTewlveToEighteen', minAge: 12, maxAge: 18, gender: Gender.female}
      ];
      ageGenderStatistics.forEach(({ key, minAge, maxAge, gender }) => {
        const members = allMembers.filter(m => m.age >= minAge && m.age < maxAge && m.gender === gender);
        this.addStatistics(key, this.sortedAllMembers(members));
      });
      const specialStatistics = [
        { key: 'statistics.totalAdultCounts', minAge: 17},
        { key: 'statistics.totalMembersAdultAndChildren', minAge: 4}
      ];
      specialStatistics.forEach(({ key, minAge }) => {
        const members = allMembers.filter(m => m.age > minAge);
        this.addStatistics(key, this.sortedAllMembers(members));
      });
      const totalStatistics = [
        { key: 'statistics.totalMenCount', minAge: 18, gender: Gender.male},
        { key: 'statistics.totalWomenCount', minAge: 18, gender: Gender.female},
        { key: 'statistics.totalMenAboveFifty', minAge: 50, gender: Gender.male},
        { key: 'statistics.totalWomenAboveFifty', minAge: 50, gender: Gender.female}
      ];
      totalStatistics.forEach(({ key, minAge, gender }) => {
        const members = allMembers.filter(m => m.age >= minAge && m.gender === gender);
        this.addStatistics(key, this.sortedAllMembers(members));
      });
      const singleRoomTypeStatistics = [
        { key: 'room.singleMale', roomType: RoomType.single, gender: Gender.male },
        { key: 'room.singleFemale', roomType: RoomType.single, gender: Gender.female },
      ];
      singleRoomTypeStatistics.forEach(({ key, roomType, gender }) => {
        const members = allMembers.filter(m => m.roomType === roomType && m.isMain && m.gender === gender);
        this.addStatistics(key, this.sortedAllMembers(members), members.length, roomType);
      });
      const roomTypeStatistics = [
        { key: 'room.single', roomType: RoomType.single },
        { key: 'common.double', roomType: RoomType.double },
        { key: 'common.triple', roomType: RoomType.triple },
        { key: 'common.quad', roomType: RoomType.quad }
      ];
      roomTypeStatistics.forEach(({ key, roomType }) => {
        const primaryMembers = allMembers.filter(m => m.roomType === roomType && m.isMain && m.age > 4);
        const members = allMembers.filter(m =>
          (m.roomType === roomType && m.isMain) ||
          (m.primaryId && m.age > 4 && primaryMembers.some(pm => pm.id === m.primaryId))
        );
        this.addStatistics(key, this.sortedAllMembers(members), primaryMembers.length, roomType);
      });
      this.addStatistics('statistics.cancelledMembers', this.sortedAllMembers(cancelledMembers));
      const primaryMembers = allMembers.filter(m => m.isMain);
      const otherMembers = allMembers.filter(m => !m.isMain);
      primaryMembers.forEach(primary => {
        const relatedMembers = otherMembers.filter(c => c.primaryId === primary.id);
        primary.totalCost = this.getTotalCost(primary, relatedMembers);
      });
      const totalCost = primaryMembers.reduce((sum, m) => sum + m.totalCost, 0);
      const totalPaid = primaryMembers.reduce((sum, m) => sum + m.paid, 0);
      const totalRemaining = totalCost - totalPaid;
      const paidMembers = primaryMembers.filter(m => m.paid > 0);
      const remainingMembers = primaryMembers.filter(m => m.totalCost > m.paid);
      this.addCostStatistics({
        key: 'common.totalCost',
        amount: totalCost,
        members: this.formatMembers(primaryMembers, 'totalCost')
      });
      
      this.addCostStatistics({
        key: 'common.paid',
        amount: totalPaid,
        members: this.formatMembers(paidMembers, 'paid')
      });
      this.addCostStatistics({
        key: 'common.remaining',
        amount: totalRemaining,
        members: this.formatMembers(remainingMembers, 'remaining')
      });
    });
  }

  private addStatistics(key: string, members: any[], roomCount?: number, roomType?: RoomType): void {
    this.model.items.push({
      key,
      count: members.length,
      members: members.map(m => m.name),
      room: roomCount,
      roomType
    });
  };

  private sortedAllMembers(allMembers: IAllSubscriptionDataSourceVm[]): IAllSubscriptionDataSourceVm[] {
    return allMembers.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  private addCostStatistics(cost: ICost): void {
    this.model.costList.push(cost);
  }

  private formatMembers(members: IAllSubscriptionDataSourceVm[], field: keyof IAllSubscriptionDataSourceVm): string[] {
    return members.sort((a, b) => a.name.localeCompare(b.name, 'ar')).map(m => {
      let value;
      if (field === 'remaining') {
        value = m.totalCost - m.paid;
      } else {
        value = m[field] || 0;
      }
      return `${m.name} - ${value} جنيه`;
    });
  }

  private getTransportPrice(transportId: string): number {
    if (transportId && this.model.buses.length > 0) {
      const bus = this.model.buses.find(b => b.id === transportId);
      if (bus) {
        return +bus.price;
      }
      return 0;
    }
    return 0;
  }

  private getTotalCost(primary: IAllSubscriptionDataSourceVm, otherMembers: IAllSubscriptionDataSourceVm[]): number {
    if (primary) {
      let adultCost = 0;
      let primaryCost = 0;
      let childrenCost = 0;
      const price = this.reservationUtilityService.getReservationPrice(primary.roomType);
      primaryCost = this.getTransportPrice(primary.transportationId) + price;
      const members = otherMembers.filter(c => c.primaryId === primary.id);
      if (otherMembers.length > 0) {
        const adults = members.filter(c => new Date().getFullYear() - c.birthDate.toDate().getFullYear() >= 8);
        if (adults && adults.length > 0) {
          adults.forEach(adult => {
            const transportPrice = this.getTransportPrice(adult.transportationId);
            adultCost += (transportPrice + price);
          });
        }
        const childrenBetweenFourAndEight = members.filter(c => new Date().getFullYear() - c.birthDate.toDate().getFullYear() > 4 
          && new Date().getFullYear() - c.birthDate.toDate().getFullYear() < 8);
        if (childrenBetweenFourAndEight && childrenBetweenFourAndEight.length > 0) {
          childrenBetweenFourAndEight.forEach((adult) => {
            const transportPrice = this.getTransportPrice(adult.transportationId);
            childrenCost += ((0.5 * price) + transportPrice);
          });
        }
      }
      return primaryCost + adultCost + childrenCost;
    }
    return 0;
  }
}
