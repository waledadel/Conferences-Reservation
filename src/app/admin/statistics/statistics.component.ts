import { Component, OnInit } from '@angular/core';

import { AdminService } from '../admin.service';
import { FireStoreService } from '@app/services';
import { Gender, IBus } from '@app/models';
import { Constants } from '@app/constants';
import { StatisticsModel } from './statistics.models';
import { RoomType } from 'app/shared/models/ticket';

@Component({
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {

  model: StatisticsModel;

  constructor(private adminService: AdminService, private fireStoreService: FireStoreService) { }

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
      const busStatistics = [
        { key: 'statistics.shoubraBusCount', busName: 'شبرا' },
        { key: 'statistics.misrBusCount', busName: 'مصر' }
      ];
      busStatistics.forEach(({ key, busName }) => {
        const bus = this.model.buses.find(m => m.name.includes(busName));
        if (bus) {
          const members = res.filter(m => m.transportationId === bus.id);
          this.addStatistics(key, members);
        }
      });
      const ageGenderStatistics = [
        { key: 'statistics.childrenBoysCountFromFourToEight', minAge: 4, maxAge: 8, gender: Gender.male },
        { key: 'statistics.childrenGirlsCountFromFourToEight', minAge: 4, maxAge: 8, gender: Gender.female },
        { key: 'statistics.childrenBoysCountFromEightToTen', minAge: 8, maxAge: 10, gender: Gender.male },
        { key: 'statistics.childrenGirlsCountFromEightToTen', minAge: 8, maxAge: 10, gender: Gender.female },
        { key: 'statistics.childrenBoysCountFromTenToTwelve', minAge: 10, maxAge: 12, gender: Gender.male },
        { key: 'statistics.childrenGirlsCountFromTenToTwelve', minAge: 10, maxAge: 12, gender: Gender.female },
        { key: 'statistics.youthBoysCountFromTewlveToEighteen', minAge: 12, maxAge: 18, gender: Gender.male },
        { key: 'statistics.youthGirlsCountFromTewlveToEighteen', minAge: 12, maxAge: 18, gender: Gender.female }
      ];
      ageGenderStatistics.forEach(({ key, minAge, maxAge, gender }) => {
        const members = res.filter(m => m.age >= minAge && m.age < maxAge && m.gender === gender);
        this.addStatistics(key, members);
      });
      const specialStatistics = [
        { key: 'statistics.totalAdultCounts', minAge: 18 },
        { key: 'statistics.totalMembersAdultAndChildren', minAge: 4 }
      ];
      specialStatistics.forEach(({ key, minAge }) => {
        const members = res.filter(m => m.age >= minAge);
        this.addStatistics(key, members);
      });
      const totalStatistics = [
        { key: 'statistics.totalMenCount', minAge: 18, gender: Gender.male },
        { key: 'statistics.totalWomenCount', minAge: 18, gender: Gender.female },
        { key: 'statistics.totalMenAboveFifty', minAge: 50, gender: Gender.male },
        { key: 'statistics.totalWomenAboveFifty', minAge: 50, gender: Gender.female }
      ];
      totalStatistics.forEach(({ key, minAge, gender }) => {
        const members = res.filter(m => m.age >= minAge && m.gender === gender);
        this.addStatistics(key, members);
      });
      const roomTypeStatistics = [
        { key: 'room.single', roomType: RoomType.single },
        { key: 'common.double', roomType: RoomType.double },
        { key: 'common.triple', roomType: RoomType.triple },
        { key: 'common.quad', roomType: RoomType.quad }
      ];
      roomTypeStatistics.forEach(({ key, roomType }) => {
        const members = res.filter(m => m.roomType === roomType && m.isMain);
        this.addStatistics(key, members);
      });
    });
  }

  private addStatistics (key: string, members: any[]): void {
    this.model.items.push({
      key,
      count: members.length,
      members: members.map(m => m.name)
    });
  };
}
