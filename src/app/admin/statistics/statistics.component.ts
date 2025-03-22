import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, KeyValue } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AdminService } from '../admin.service';
import { FireStoreService } from '@app/services';
import { Gender, IBus } from '@app/models';
import { Constants } from '@app/constants';
import { ICost, StatisticsModel } from './statistics.models';
import { BookingStatus, IAllSubscriptionDataSourceVm, ITicket, RoomType } from 'app/shared/models/ticket';
import { MemberService } from '../primary/member.service';
import { SharedModule } from 'app/shared/shared.module';

@Component({
  templateUrl: './statistics.component.html',
  imports: [SharedModule],
  providers: [DatePipe]
})
export class StatisticsComponent implements OnInit {

  model: StatisticsModel;

private readonly memberService = inject(MemberService);
private readonly datePipe = inject(DatePipe);

  constructor(private adminService: AdminService, private fireStoreService: FireStoreService) { }

  ngOnInit(): void {
    this.adminService.updatePageTitle('الإحصائيات');
    this.initModel();
    this.getAllData();
  }

  private initModel(): void {
    this.model = new StatisticsModel();
  }

  private getAllData(): void {
    forkJoin({
      members: this.fireStoreService.getAll<ITicket>(Constants.RealtimeDatabase.tickets),
      buses: this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses),
    }).subscribe(({ members, buses }) => {
      this.setStatistics(members, buses);
    });
  }

  private setStatistics(allMembersData: ITicket[], buses: IBus[]): void {
    const membersData = this.memberService.getAllMembersDataSource(allMembersData, buses);
    const allowedBookingStatus = [BookingStatus.new, BookingStatus.confirmed];
    const cancelledBookingStatus = [BookingStatus.canceled, BookingStatus.deleted];
    const allMembers = membersData.filter(m => allowedBookingStatus.includes(m.bookingStatus) || !m.bookingStatus);
    const cancelledMembers = membersData.filter(m => cancelledBookingStatus.includes(m.bookingStatus) && m.isMain);
    const waitingMembers = membersData.filter(m => m.bookingStatus === BookingStatus.waiting);
    const busStatistics = [
      { key: 'statistics.shoubraBusCount', busName: 'شبرا' },
      { key: 'statistics.misrBusCount', busName: 'مصر' }
    ];
    busStatistics.forEach(({ key, busName }) => {
      const bus = buses.find(m => m.name.includes(busName));
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
    const notPaidMembers = allMembers.filter(m => m.paid === 0);
    this.addStatistics('statistics.notPaidMembers', this.sortedAllMembers(notPaidMembers));
    const waitingMembersGroup = waitingMembers.sort((a, b) => new Date(a.bookingDate.toDate()).getTime() - new Date(b.bookingDate.toDate()).getTime());
    this.model.items.push({
      key: 'statistics.waitingListMembers',
      count: waitingMembersGroup.length,
      members: waitingMembersGroup.map(m => {
        const formattedDate = this.datePipe.transform(m.bookingDate.toDate(), 'medium');
        return `${m.name} - ${formattedDate}`;
      })
    });
    const primaryMembers = allMembers.filter(m => m.isMain);
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

  private formatMembers(members: IAllSubscriptionDataSourceVm[], field: keyof IAllSubscriptionDataSourceVm): KeyValue<string, string>[] {
    return members.sort((a, b) => a.name.localeCompare(b.name, 'ar')).map(m => {
      let amount;
      if (field === 'remaining') {
        amount = m.totalCost - m.paid;
      } else {
        amount = m[field] || 0;
      }
      return { key: m.name, value: `${amount} جنيه`};
    });
  }
}
