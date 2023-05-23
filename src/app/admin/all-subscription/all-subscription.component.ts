import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { BookingStatus, Gender, IAddress, IAllSubscriptionDataSourceVm, IBus } from '@app/models';
import { FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';
import { WINDOW } from 'app/shared/services/window.service';

@Component({
  templateUrl: './all-subscription.component.html'
})
export class AllSubscriptionComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  total = 0;
  readonly desktopColumns = ['name', 'mobile', 'birthDate', 'age', 'address', 'transportation', 'gender', 'status', 'room', 'actions'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IAllSubscriptionDataSourceVm>([]);
  addressList: Array<IAddress> = [];
  buses: Array<IBus> = [];
  isMobileView = false;
  isAdvancedSearchOpened = false;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(
    private fireStoreService: FireStoreService, 
    private adminService: AdminService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit(): void {
    this.detectMobileView();
    this.getBuses();
    this.getAddress();
    this.adminService.updatePageTitle('كل المشتركين');
  }

  openWhatsApp(number: string): void {
    this.window.open(`${Constants.SocialMedia.whatsApp}+2${number}`, '_blank');
  }

  showAdvancedFilter(): void {
    this.isAdvancedSearchOpened = !this.isAdvancedSearchOpened;
  }

  onFilterChanged(event: IAdvancedFilterForm): void {
    this.dataSource.filter = JSON.stringify(event);
    if (this.isMobileView) {
      this.isAdvancedSearchOpened = false;
    }
  }

  private getAddress(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.addressList = data;
      this.getTickets();
    });
  }

  private getTickets(): void {
    this.fireStoreService.getAllSubscription().subscribe(res => {
      const data = res.map(item => ({
        ...item,
        address: this.getAddressById(item.addressId),
        transportationName: this.getBusNameById(item.transportationId)
      }));
      this.dataSource = new MatTableDataSource(data);
      this.total = res.length;
      this.dataSource.sort = this.sort;
      this.initFilterPredicate();
    });
  }

  private getAddressById(addressId: string): string {
    if (addressId && this.addressList.length > 0) {
      const address = this.addressList.find(a => a.id === addressId);
      if (address) {
        return address.name;
      }
      return '';
    }
    return '';
  }

  private detectMobileView(): void {
    this.isMobileView = this.isMobile;
    if (this.isMobileView) {
      this.displayedColumns = ['mobileView'];
    } else {
      this.displayedColumns = this.desktopColumns;
    }
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.buses = data;
    });
  }

  private getBusNameById(id: string): string {
    if (id && this.buses.length > 0) {
      const bus = this.buses.find(b => b.id === id);
      if (bus) {
        return bus.name;
      }
      return '';
    }
    return '';
  }

  private initFilterPredicate(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchString = JSON.parse(filter);
      const mobileFound = data.mobile.toString().trim().toLowerCase().indexOf(searchString.mobile) !== -1;
      const nameFound = data.name.toString().trim().toLowerCase().indexOf(searchString.name) !== -1;
      let transportationFound = data.transportationId === searchString.transportationId;
      let fromAgeFound = +data.age >= +searchString.fromAge;
      let toAgeFound = +data.age < +searchString.toAge;
      let birthDateMonthFound = data.birthDateMonth === searchString.birthDateMonth;
      let bookingStatusFound = data.bookingStatus === searchString.bookingStatus;
      let genderFound = data.gender === searchString.gender;
      if (!searchString.fromAge || searchString.fromAge < 1) {
        fromAgeFound = true;
      }
      if (!searchString.toAge || searchString.toAge < 1) {
        toAgeFound = true;
      }
      if (!searchString.birthDateMonth || searchString.birthDateMonth < 1) {
        birthDateMonthFound = true;
      }
      if (!searchString.bookingStatus || searchString.bookingStatus === BookingStatus.all) {
        bookingStatusFound = true;
      }
      if (!searchString.gender || searchString.gender === Gender.all) {
        genderFound = true;
      }
      if (!searchString.transportationId || searchString.transportationId == 'all') {
        transportationFound = true;
      }
      return nameFound && mobileFound && transportationFound && genderFound && bookingStatusFound
        && fromAgeFound && toAgeFound && birthDateMonthFound;
    };
  }
}
