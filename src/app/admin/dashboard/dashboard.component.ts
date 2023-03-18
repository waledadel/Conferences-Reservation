import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IDashboardCard  } from '@app/models';
import { FireStoreService } from '@app/services';


@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(public fireStoreService: FireStoreService, private router: Router) {}

  cards: IDashboardCard[] = [
    {
      route: '/admin/users',
      label: 'Users',
      value: 0
    },
    {
      route: '/admin/trains',
      label: 'Trains',
      value: 0
    },
    {
      route: 'admin/categories',
      label: 'Categories',
      value: 0
    },
    {
      route: '/admin/stations',
      label: 'Stations',
      value: 0
    }
  ];

  ngOnInit(): void {
    this.getUsers();
    this.getCategories();
    this.getStations();
    this.getTrains();
  }

  navigateToPage(url: string): void {
    this.router.navigateByUrl(url);
  }

  private getUsers(): void {
    // this.baseService.getAll<ITrain>(Constants.RealtimeDatabase.users).subscribe(data => {
    //   this.cards[0].value = data.length;
    // });
  }

  private getTrains(): void {
    // this.baseService.getAll<ITrain>(Constants.RealtimeDatabase.trains).subscribe(data => {
    //   this.cards[1].value = data.length;
    // });
  }

  private getCategories(): void {
    // this.baseService.getAll<ICategory>(Constants.RealtimeDatabase.categories).subscribe(data => {
    //   this.cards[2].value = data.length;
    // });
  }

  private getStations(): void {
    // this.baseService.getAll<IStation>(Constants.RealtimeDatabase.stations).subscribe(data => {
    //   this.cards[3].value = data.length;
    // });
  }

}
