import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Timestamp } from '@angular/fire/firestore';

import { IBus, IRelatedMemberViewModel, IPrimaryDataSourceVm, ISettings, ITicket, ICostDetailsDataSourceVm, Gender, BookingStatus, IUser } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';
import { Constants } from '@app/constants';
import { CostDetailsComponent } from './cost-details/cost-details.component';
import { AdminService } from '../admin.service';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';
import { PrimaryModel } from './primary.models';

@Component({
  templateUrl: './primary.component.html'
})
export class PrimaryComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  model: PrimaryModel;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    private adminService: AdminService
  ) {
    this.model = new PrimaryModel();
  }

  ngOnInit(): void {
    this.detectMobileView();
    this.getAllUsers();
    this.getBuses();
    this.getSettings();
    this.adminService.updatePageTitle('الإشتراكات الرئيسية');
  }

  update(item: Partial<ITicket>): void {
    this.dialogService.openAddEditDialog(ManageReservationComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.updateTableRow(item);
      }
    });
  }

  delete(item: Partial<ITicket>): void {
    if (item.name) {
      this.dialogService.openConfirmDeleteDialog(item.name).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
        if (res && res.confirmDelete && item.id) {
          this.fireStoreService.getPrimaryWithRelatedParticipants(item.id).subscribe(list => {
            const ids = list.map(item => item.id);
            if (ids && ids.length > 0) {
              this.fireStoreService.deleteReservation(ids).subscribe(() => {
                this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully'));
                this.removeRow(item);
              });
            }
          });
        }
      });
    }
  }

  viewCostDetails(item: IPrimaryDataSourceVm): void {
    const list: Array<ICostDetailsDataSourceVm> = [];
    // Primary
    list.push({
      isChild: false,
      isMain: true,
      name: item.name,
      bedPrice: 0,
      needBed: true,
      privateTransport: this.isPrivateTransport(item.transportationId),
      reservationPrice: this.model.adultReservationPrice,
      transportPrice: this.getTransportPrice(item.transportationId)
    });
    // other members
    const allRelatedMembers = this.model.notPrimaryMembers.filter(m => m.primaryId === item.primaryId);
    if (allRelatedMembers.length > 0) {
      const adults = allRelatedMembers.filter(m => !m.isChild);
      const children = allRelatedMembers.filter(m => m.isChild);
      if (children && children.length > 0) {
        children.forEach(item => {
          list.push({
            isChild: true,
            isMain: false,
            name: item.name,
            bedPrice: this.getChildBedPrice(item),
            needBed: item.needsSeparateBed,
            privateTransport: this.isPrivateTransport(item.transportationId),
            reservationPrice: this.getChildReservationPrice(item.birthDate),
            transportPrice: this.getTransportPrice(item.transportationId)
          });
        });
      }
      if (adults && adults.length > 0) {
        adults.forEach(item => {
          list.push({
            isChild: false,
            isMain: false,
            name: item.name,
            bedPrice: 0,
            needBed: item.needsSeparateBed,
            privateTransport: this.isPrivateTransport(item.transportationId),
            reservationPrice: this.model.adultReservationPrice,
            transportPrice: this.getTransportPrice(item.transportationId)
          });
        });
      }
    }
    this.dialogService.openAddEditDialog(CostDetailsComponent, 'xlg', true, list);
  }

  getAllAdultsCount(): number {
    return this.model.dataSource.data.map(t => t.adultsCount + 1).reduce((acc, value) => acc + value, 0);
  }

  getAllChildrenCount(): number {
    return this.model.dataSource.data.map(t => t.childrenCount).reduce((acc, value) => acc + value, 0);
  }

  getAllTotalCost(): number {
    return this.model.dataSource.data.map(t => t.totalCost).reduce((acc, value) => acc + value, 0);
  }

  getAllPaid(): number {
    return this.model.dataSource.data.map(t => t.paid).reduce((acc, value) => acc + value, 0);
  }

  getAllRemaining(): number {
    return this.model.dataSource.data.map(t => t.totalCost - t.paid).reduce((acc, value) => acc + value, 0);
  }

  onFilterChanged(event: IAdvancedFilterForm): void {
    this.model.dataSource.filter = JSON.stringify(event);
    if (this.model.isMobileView) {
      this.model.isAdvancedSearchOpened = false;
    }
  }

  showAdvancedFilter(): void {
    this.model.isAdvancedSearchOpened = !this.model.isAdvancedSearchOpened;
  }

  private isPrivateTransport(transportId: string): boolean {
    if (transportId && this.model.buses.length > 0) {
      const bus = this.model.buses.find(b => b.id === transportId);
      if (bus) {
        return bus.price > 0 ? false : true;
      }
      return false;
    }
    return false;
  }

  private getNotPrimarySubscription(takeCount = 1): void {
    this.fireStoreService.getNotPrimarySubscription(takeCount).subscribe(res => {
      this.model.notPrimaryMembers = res;
      this.getPrimaryTickets();
    });
  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      const data = res.map(item => ({
        ...item,
        totalCost: this.getTotalCost(item, this.model.notPrimaryMembers),
        transportationName: this.getBusNameById(item.transportationId),
        lastUpdatedBy: this.getUserById(item.lastUpdateUserId)
      }));
      this.model.dataSource = new MatTableDataSource(data);
      this.model.dataSource.sort = this.sort;
      this.initFilterPredicate();
    });
  }

  private getBusNameById(id: string): string {
    if (id && this.model.buses.length > 0) {
      const bus = this.model.buses.find(b => b.id === id);
      if (bus) {
        return bus.name;
      }
      return '';
    }
    return '';
  }

  private getUserById(id: string): string {
    if (id && this.model.users.length > 0) {
      const user = this.model.users.find(b => b.id === id);
      if (user) {
        return user.fullName;
      }
      return '';
    }
    return '';
  }

  private getSettings(): void {
    this.fireStoreService.getAll<ISettings>(Constants.RealtimeDatabase.settings).subscribe(data => {
      if (data && data.length > 0) {
        this.model.adultReservationPrice = data[0].reservationPrice;
        this.model.childReservationPriceLessThanEight = data[0].childReservationPriceLessThanEight;
        this.model.childReservationPriceMoreThanEight = data[0].childReservationPriceMoreThanEight;
        this.model.childBedPrice = data[0].childBedPrice;
        this.getNotPrimarySubscription();
      }
    });
  }

  private updateTableRow(item: Partial<ITicket>): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.tickets}/${item.id}`).subscribe((res: IPrimaryDataSourceVm) => {
      if (res) {
        const index = this.model.dataSource.data.findIndex(t => t.id === item.id);
        if (index > -1 && res.primaryId) {
          this.fireStoreService.getRelatedMembersByPrimaryId(res.primaryId, 1).subscribe(list => {
            if (list && list.length > 0) {
              this.model.dataSource.data[index] = {
                ...res,
                totalCost: this.getTotalCost(res, list),
                transportationName: this.getBusNameById(res.transportationId),
                birthDateMonth: res.birthDate.toDate().getMonth() + 1,
                lastUpdatedBy: this.getUserById(res.lastUpdateUserId)
              };
            } else {
              this.model.dataSource.data[index] = {
                ...res,
                totalCost: this.getTotalCost(res, this.model.notPrimaryMembers),
                transportationName: this.getBusNameById(res.transportationId),
                birthDateMonth: res.birthDate.toDate().getMonth() + 1,
                lastUpdatedBy: this.getUserById(res.lastUpdateUserId)
              };
            }
            this.model.dataSource._updateChangeSubscription();
          });
        }
      }
    });
  }

  private removeRow(item: Partial<ITicket>): void {
    const index = this.model.dataSource.data.findIndex(t => t.id === item.id);
    if (index > -1) {
      this.model.dataSource.data.splice(index, 1);
      this.model.dataSource._updateChangeSubscription();
    }
  }

  private getTotalCost(ticket: IPrimaryDataSourceVm, list: Array<IRelatedMemberViewModel>): number {
    if (ticket) {
      let childrenCost = 0;
      let adultCost = 0;
      let primaryCost = 0;
      primaryCost = this.model.adultReservationPrice + this.getTransportPrice(ticket.transportationId);
      if (list.length > 0) {
        if (ticket.childrenCount > 0) {
          const children = list.filter(c => c.primaryId === ticket.id && c.isChild);
          if (children && children.length > 0) {
            children.forEach(child => {
              const reservationPrice = this.getChildReservationPrice(child.birthDate);
              const bedPrice = this.getChildBedPrice(child);
              const transportPrice = this.getTransportPrice(child.transportationId);
              childrenCost += (reservationPrice + bedPrice + transportPrice);
            });
          }
        }
        if (ticket.adultsCount > 0) {
          const adults = list.filter(c => c.primaryId === ticket.id && !c.isChild);
          if (adults && adults.length > 0) {
            adults.forEach(adult => {
              const price = this.model.adultReservationPrice;
              const transportPrice = this.getTransportPrice(adult.transportationId);
              adultCost += price + transportPrice;
            });
          }
        }
      }
      return primaryCost + adultCost + childrenCost;
    }
    return 0;
  }

  private getChildReservationPrice(birthDate?: Timestamp): number {
    if (birthDate) {
      const childYears = new Date().getFullYear() - birthDate.toDate().getFullYear();
      if (childYears >= 8 && childYears < 12) {
        return this.model.childReservationPriceMoreThanEight;
      } else if(childYears >= 4 && childYears < 8) {
        return this.model.childReservationPriceLessThanEight;
      } else {
        return 0;
      }
    }
    return 0;
  }

  private getChildBedPrice(child: IRelatedMemberViewModel ): number {
    if (child) {
      const childYears = new Date().getFullYear() - child.birthDate.toDate().getFullYear();
      if (childYears >= 8 && childYears < 12) {
        return 0; // Already pay as the adult
      } else {
        return child.needsSeparateBed ? this.model.childBedPrice : 0;
      }
    }
    return 0;
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.buses = data;
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

  private getAllUsers(): void {
    this.fireStoreService.getAll<IUser>(Constants.RealtimeDatabase.users).subscribe(data => {
      this.model.users = data;
    });
  }

  private detectMobileView(): void {
    this.model.isMobileView = this.isMobile;
    if (this.model.isMobileView) {
      this.model.displayedColumns = ['mobileView'];
    } else {
      this.model.displayedColumns = this.model.desktopColumn;
    }
  }

  private initFilterPredicate(): void {
    this.model.dataSource.filterPredicate = (data, filter) => {
      const searchString = JSON.parse(filter);
      const mobileFound = data.mobile.toString().trim().toLowerCase().indexOf(searchString.mobile) !== -1;
      const nameFound = data.name.toString().trim().toLowerCase().indexOf(searchString.name) !== -1;
      let transportationFound = data.transportationId === searchString.transportationId;
      let fromAgeFound = +data.age >= +searchString.fromAge;
      let toAgeFound = +data.age < +searchString.toAge;
      let birthDateMonthFound = data.birthDateMonth === searchString.birthDateMonth;
      let bookingStatusFound = data.bookingStatus === searchString.bookingStatus;
      let genderFound = data.gender === searchString.gender;
      let paidFound = +data.paid === +searchString.paid;
      let totalFound = +data.totalCost === +searchString.total;
      let remainingFound = ((+data.totalCost) - (+data.paid)) === +searchString.remaining;
      let adultsCountFound = +data.adultsCount === (+searchString.adultsCount - 1); // We minus 1 for primary count
      let childrenCountFound = +data.childrenCount === +searchString.childrenCount;
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
      if (!searchString.paid || searchString.paid < 1) {
        paidFound = true;
      }
      if (!searchString.total || searchString.total < 1) {
        totalFound = true;
      }
      if (!searchString.adultsCount || searchString.adultsCount < 1) {
        adultsCountFound = true;
      }
      if (!searchString.childrenCount || searchString.childrenCount < 1) {
        childrenCountFound = true;
      }
      if (!searchString.remaining || searchString.remaining < 1) {
        remainingFound = true;
      }
      return nameFound && mobileFound && transportationFound && genderFound && bookingStatusFound && paidFound && totalFound 
        && fromAgeFound && toAgeFound && birthDateMonthFound && adultsCountFound && childrenCountFound && remainingFound;
    };
  }
}
