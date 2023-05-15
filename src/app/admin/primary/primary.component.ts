import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { Timestamp } from '@angular/fire/firestore';

import { IBus, IRelatedMemberViewModel, IPrimaryDataSourceVm, ISettings, ITicket, ICostDetailsDataSourceVm, Gender, BookingStatus } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';
import { Constants } from '@app/constants';
import { CostDetailsComponent } from './cost-details/cost-details.component';

@Component({
  templateUrl: './primary.component.html'
})
export class PrimaryComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  total = 0;
  adultReservationPrice = 0;
  childReservationPriceLessThanEight = 0;
  childReservationPriceMoreThanEight = 0;
  childBedPrice = 0;
  readonly desktopColumn = ['name', 'mobile', 'adultsCount', 'childrenCount', 'roomId', 'transportation',
  'bookingType', 'birthDate', 'bookingDate', 'gender', 'totalCost', 'paid', 'remaining', 'adminNotes', 'userNotes', 'bookingStatus', 'actions'];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<IPrimaryDataSourceVm>([]);
  copyDataSource: Array<IPrimaryDataSourceVm> = [];
  notPrimaryMembers: Array<IRelatedMemberViewModel> = [];
  buses: Array<IBus> = [];
  isMobileView = false;
  form: FormGroup;
  isAdvancedSearchOpened = false;
  gender = Gender;
  genderList: Array<KeyValue<string, number>> = [
    {key: 'common.all', value: Gender.all},
    {key: 'common.male', value: Gender.male},
    {key: 'common.female', value: Gender.female},
  ];
  bookingStatusList: Array<KeyValue<string, BookingStatus>> = [
    {key: 'common.all', value: BookingStatus.all},
    {key: 'bookingStatus.new', value: BookingStatus.new},
    {key: 'bookingStatus.confirmed', value: BookingStatus.confirmed},
    {key: 'bookingStatus.canceled', value: BookingStatus.canceled},
    {key: 'bookingStatus.duplicated', value: BookingStatus.duplicated},
  ];
  ageRanges: Array<KeyValue<string, number>> = [
    { key: 'الكل', value: 0},
    {key: '4 - 8', value: 1},
    {key: '9 - 13', value: 2},
    {key: '14 - 17', value: 3},
    {key: '18 - 25', value: 4},
    {key: '26 - 35', value: 5},
    {key: '36 - 45', value: 6},
    {key: '+45', value: 7},
  ];
  months: KeyValue<string, number>[] = [
    { key: 'الكل', value: 0},
    { key: 'يناير', value: 1},
    { key: 'فبراير', value: 2},
    { key: 'مارس', value: 3},
    { key: 'أبريل', value: 4},
    { key: 'مايو', value: 5},
    { key: 'يونيو', value: 6},
    { key: 'يوليو', value: 7},
    { key: 'أغسطس', value: 8},
    { key: 'سبتمبر', value: 9},
    { key: 'أكتوبر', value: 10},
    { key: 'نوفمبر', value: 11},
    { key: 'ديسمبر', value: 12}
  ];
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
    private formBuilder: FormBuilder,
  ) {
    this.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.detectMobileView();
    this.getBuses();
    this.getSettings();
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
      reservationPrice: this.adultReservationPrice,
      transportPrice: this.getTransportPrice(item.transportationId)
    });
    // other members
    const allRelatedMembers = this.notPrimaryMembers.filter(m => m.primaryId === item.primaryId);
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
            reservationPrice: this.adultReservationPrice,
            transportPrice: this.getTransportPrice(item.transportationId)
          });
        });
      }
    }
    this.dialogService.openAddEditDialog(CostDetailsComponent, 'xlg', true, list);
  }

  getAllAdultsCount(): number {
    return this.dataSource.data.map(t => t.adultsCount + 1).reduce((acc, value) => acc + value, 0);
  }

  getAllChildrenCount(): number {
    return this.dataSource.data.map(t => t.childrenCount).reduce((acc, value) => acc + value, 0);
  }

  getAllTotalCost(): number {
    return this.dataSource.data.map(t => t.totalCost).reduce((acc, value) => acc + value, 0);
  }

  getAllPaid(): number {
    return this.dataSource.data.map(t => t.paid).reduce((acc, value) => acc + value, 0);
  }

  getAllRemaining(): number {
    return this.dataSource.data.map(t => t.totalCost - t.paid).reduce((acc, value) => acc + value, 0);
  }

  reset(): void {
    this.form.patchValue({
      name: '',
      mobile: '',
      adultsCount: 0,
      childrenCount: 0,
      paid: 0,
      total: 0,
      remaining: 0,
      transportationId: 'all',
      gender: Gender.all,
      bookingStatus: BookingStatus.all,
      birthDateMonth: 0,
      ageRange: 0
    });
    this.dataSource.filter = JSON.stringify(this.form.value);
  }

  filter(): void {
    this.dataSource.filter = JSON.stringify(this.form.value);
  }

  showAdvancedFilter(): void {
    this.isAdvancedSearchOpened = !this.isAdvancedSearchOpened;
  }

  private isPrivateTransport(transportId: string): boolean {
    if (transportId && this.buses.length > 0) {
      const bus = this.buses.find(b => b.id === transportId);
      if (bus) {
        return bus.price > 0 ? false : true;
      }
      return false;
    }
    return false;
  }

  private getNotPrimarySubscription(takeCount = 1): void {
    this.fireStoreService.getNotPrimarySubscription(takeCount).subscribe(res => {
      this.notPrimaryMembers = res;
      this.getPrimaryTickets();
    });
  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      const data = res.map(item => ({
        ...item,
        totalCost: this.getTotalCost(item, this.notPrimaryMembers),
        transportationName: this.getBusNameById(item.transportationId),
        birthDateMonth: item.birthDate.toDate().getMonth() + 1,
        ageRange: this.getAgeRange(item.birthDate)
      }));
      this.copyDataSource = data;
      this.dataSource = new MatTableDataSource(this.copyDataSource);
      this.total = res.length;
      this.dataSource.sort = this.sort;
      this.initFilterPredicate();
    });
  }

  private getAgeRange(birthDate: Timestamp): number {
    const years = new Date().getFullYear() - birthDate.toDate().getFullYear();
    if (years > 45) {
      return 7;
    } else if (years >= 36 && years <= 45) {
      return 6;
    } else if (years >= 26 && years <= 35) {
      return 5;
    } else if (years >= 18 && years <= 25) {
      return 4;
    } else if (years >= 14 && years <= 17) {
      return 3;
    } else if (years >= 9 && years <= 13) {
      return 2;
    } else {
      return 1;
    }
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

  private getSettings(): void {
    this.fireStoreService.getAll<ISettings>(Constants.RealtimeDatabase.settings).subscribe(data => {
      if (data && data.length > 0) {
        this.adultReservationPrice = data[0].reservationPrice;
        this.childReservationPriceLessThanEight = data[0].childReservationPriceLessThanEight;
        this.childReservationPriceMoreThanEight = data[0].childReservationPriceMoreThanEight;
        this.childBedPrice = data[0].childBedPrice;
        this.getNotPrimarySubscription();
      }
    });
  }

  private updateTableRow(item: Partial<ITicket>): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.tickets}/${item.id}`).subscribe((res: IPrimaryDataSourceVm) => {
      if (res) {
        const index = this.dataSource.data.findIndex(t => t.id === item.id);
        if (index > -1 && res.primaryId) {
          this.fireStoreService.getRelatedMembersByPrimaryId(res.primaryId, 1).subscribe(list => {
            if (list && list.length > 0) {
              this.dataSource.data[index] = {...res, totalCost: this.getTotalCost(res, list)};
            } else {
              this.dataSource.data[index] = {...res, totalCost: this.getTotalCost(res, this.notPrimaryMembers)};
            }
            this.dataSource._updateChangeSubscription();
          });
        }
      }
    });
  }

  private removeRow(item: Partial<ITicket>): void {
    const index = this.dataSource.data.findIndex(t => t.id === item.id);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      this.total -= 1;
    }
  }

  private getTotalCost(ticket: IPrimaryDataSourceVm, list: Array<IRelatedMemberViewModel>): number {
    if (ticket) {
      let childrenCost = 0;
      let adultCost = 0;
      let primaryCost = 0;
      primaryCost = this.adultReservationPrice + this.getTransportPrice(ticket.transportationId);
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
              const price = this.adultReservationPrice;
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
        return this.childReservationPriceMoreThanEight;
      } else if(childYears >= 4 && childYears < 8) {
        return this.childReservationPriceLessThanEight;
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
        return child.needsSeparateBed ? this.childBedPrice : 0;
      }
    }
    return 0;
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.buses = data;
    });
  }

  private getTransportPrice(transportId: string): number {
    if (transportId && this.buses.length > 0) {
      const bus = this.buses.find(b => b.id === transportId);
      if (bus) {
        return +bus.price;
      }
      return 0;
    }
    return 0;
  }

  private detectMobileView(): void {
    this.isMobileView = this.isMobile;
    if (this.isMobileView) {
      this.displayedColumns = ['mobileView'];
    } else {
      this.displayedColumns = this.desktopColumn;
    }
  }

  private initFormModels() {
    return this.formBuilder.group({
      name: [''],
      mobile: [''],
      adultsCount: [0],
      childrenCount: [0],
      paid: [0],
      total: [0],
      remaining: [0],
      transportationId: ['all'],
      gender: [Gender.all],
      bookingStatus: BookingStatus.all,
      birthDateMonth: [0],
      ageRange: [0]
    });
  }

  private initFilterPredicate(): void {
    this.dataSource.filterPredicate = (data, filter) => {
      const searchString = JSON.parse(filter);
      const mobileFound = data.mobile.toString().trim().toLowerCase().indexOf(searchString.mobile) !== -1;
      const nameFound = data.name.toString().trim().toLowerCase().indexOf(searchString.name) !== -1;
      let transportationFound = data.transportationId === searchString.transportationId;
      let ageRangeFound = data.ageRange === searchString.ageRange;
      let birthDateMonthFound = data.birthDateMonth === searchString.birthDateMonth;
      let bookingStatusFound = data.bookingStatus === searchString.bookingStatus;
      let genderFound = data.gender === searchString.gender;
      let paidFound = +data.paid === +searchString.paid;
      let totalFound = +data.totalCost === +searchString.total;
      let remainingFound = ((+data.totalCost) - (+data.paid)) === +searchString.remaining;
      let adultsCountFound = +data.adultsCount === (+searchString.adultsCount - 1); // We minus 1 for primary count
      let childrenCountFound = +data.childrenCount === +searchString.childrenCount;
      if (!searchString.ageRange || searchString.ageRange < 1) {
        ageRangeFound = true;
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
        && ageRangeFound && birthDateMonthFound && adultsCountFound && childrenCountFound && remainingFound;
    };
  }
}
