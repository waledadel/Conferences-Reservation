import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Timestamp } from '@angular/fire/firestore';

import { IBus, IRelatedMemberViewModel, IPrimaryDataSourceVm, ISettings, ITicket, ICostDetailsDataSourceVm, Gender, BookingStatus, IUser, BookingType, IAddress } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';
import { Constants } from '@app/constants';
import { CostDetailsComponent } from './cost-details/cost-details.component';
import { AdminService } from '../admin.service';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';
import { PrimaryModel } from './primary.models';
import { ExportMembersComponent, IExportMembers } from '../export-members/export-members.component';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';

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
    this.getAddress();
    this.getSettings();
    this.adminService.updatePageTitle('الإشتراكات الرئيسية');
  }

  openExportModal(): void {
    this.dialogService.openAddEditDialog(ExportMembersComponent, 'lg', true, true)
    .afterClosed().subscribe((res: {exportData: boolean, options: Array<IExportMembers>}) => {
      if (res && res.exportData && res.options.filter(o => o.isChecked).length > 0) {
        let exportData: Array<any> = [];
        const selectedColumns = res.options.filter(op => op.isChecked);
        const dataSource = this.model.filteredData.length > 0 ? this.model.filteredData : this.model.dataSource.data;
        dataSource.forEach(item => {
          let keyField: keyof IPrimaryDataSourceVm;
          let exportObj = {} as any;
          for (const key in item) {
            keyField = key as keyof IPrimaryDataSourceVm;
            const selectedOption = selectedColumns.find(c => c.columnName === keyField);
            if (selectedOption) {
              const genderField: keyof IPrimaryDataSourceVm = 'gender';
              const bookingStatusField: keyof IPrimaryDataSourceVm = 'bookingStatus';
              const bookingTypeField: keyof IPrimaryDataSourceVm = 'bookingType';
              const birthDateField: keyof IPrimaryDataSourceVm = 'birthDate';
              const lastUpdateDateField: keyof IPrimaryDataSourceVm = 'lastUpdateDate';
              if (keyField === genderField) {
                exportObj[selectedOption.key] = item[keyField] === Gender.female ? 'أنثي' : 'ذكر';
              } else if (keyField === birthDateField) {
                exportObj[selectedOption.key] = item[keyField].toDate();
              } else if (item[keyField] != null && keyField === lastUpdateDateField) {
                exportObj[selectedOption.key] = item[keyField]?.toDate();
              }else if (keyField === bookingTypeField) {
                exportObj[selectedOption.key] = item[keyField] === BookingType.group ? 'مجموعة' : 'فرد';
              } else if (keyField === bookingStatusField) {
                switch (item[keyField]) {
                  case BookingStatus.confirmed:
                    exportObj[selectedOption.key] = 'مؤكد';
                    break;
                  case BookingStatus.duplicated:
                    exportObj[selectedOption.key] = 'مكرر';
                    break;
                  case BookingStatus.canceled:
                    exportObj[selectedOption.key] = 'ملغي';
                    break;
                  case BookingStatus.waiting:
                      exportObj[selectedOption.key] = 'قائمة إنتظار';
                      break;
                  default:
                    exportObj[selectedOption.key] = 'جديد';
                    break;
                }
              } else {
                exportObj[selectedOption.key] = item[keyField]?.toLocaleString().trim();
              }
            }
          }
          exportData.push(exportObj);
        });
        this.adminService.exportAsExcelFile(exportData, 'الإشتراكات الرئيسية');
      }
    });
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

  showAdvancedFilter(): void {
    const filter = this.model.previousFilter != null ? this.model.previousFilter : null;
    this.dialogService.openAddEditDialog(AdvancedSearchComponent, 'lg', true, filter)
    .afterClosed().subscribe((res: IAdvancedFilterForm) => {
      if (res) {
        this.model.previousFilter = res;
        const name = res.name
        const mobile = res.mobile;
        const adultsCount = res.adultsCount;
        const childrenCount = res.childrenCount;
        const transportationId = res.transportationId;
        const bookingStatus = res.bookingStatus;
        const birthDateMonth = res.birthDateMonth;
        const fromAge = res.fromAge;
        const toAge = res.toAge;
        const total = res.total;
        const remaining = res.remaining;
        const gender = res.gender;
        const paid = res.paid;
        const addressId = res.addressId;
        // create string of our searching values and split if by '$'
        const filterValue = `${name}$${mobile}$${adultsCount}$${childrenCount}$${transportationId}$${bookingStatus}$${birthDateMonth}$${fromAge}$${toAge}$${total}$${remaining}$${gender}$${paid}$${addressId}`;
        this.model.dataSource.filter = filterValue.trim(); //.toLowerCase();
        this.model.total = this.model.dataSource.filteredData.length;
        this.model.filteredData = this.model.dataSource.filteredData;
      }
    });
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
        lastUpdatedBy: this.getUserById(item.lastUpdateUserId),
        addressName: this.getAddressNameById(item.addressId)
      }));
      this.model.dataSource = new MatTableDataSource(data);
      this.model.total = data.length;
      this.model.dataSource.sort = this.sort;
      this.model.dataSource.filterPredicate = this.getFilterPredicate();
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

  
  private getAddressNameById(id: string): string {
    if (id && this.model.addressList.length > 0) {
      const address = this.model.addressList.find(b => b.id === id);
      if (address) {
        return address.name;
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
                lastUpdatedBy: this.getUserById(res.lastUpdateUserId),
                age: this.fireStoreService.getAge(res.birthDate),
                addressName: this.getAddressNameById(res.addressId)
              };
            } else {
              this.model.dataSource.data[index] = {
                ...res,
                totalCost: this.getTotalCost(res, this.model.notPrimaryMembers),
                transportationName: this.getBusNameById(res.transportationId),
                birthDateMonth: res.birthDate.toDate().getMonth() + 1,
                lastUpdatedBy: this.getUserById(res.lastUpdateUserId),
                age: this.fireStoreService.getAge(res.birthDate),
                addressName: this.getAddressNameById(res.addressId)
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
      const today = new Date();
      const userBirthDate = birthDate.toDate();
      let childYears = today.getFullYear() - userBirthDate.getFullYear();
      const monthDiff = today.getMonth() - userBirthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < userBirthDate.getDate())) {
        childYears--;
      }
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

  private getAddress(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.model.addressList = data;
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

   getFilterPredicate(): ((data: IPrimaryDataSourceVm, filter: string) => boolean) {
    return (row: IPrimaryDataSourceVm, filters: string) => {
      // split string per '$' to array
      const filterArray = filters.split('$');
      const name = filterArray[0];
      const mobile = filterArray[1];
      const adultsCount = filterArray[2];
      const childrenCount = filterArray[3];
      const transportationId = filterArray[4];
      const bookingStatus = filterArray[5];
      const birthDateMonth = filterArray[6];
      const fromAge = filterArray[7];
      const toAge = filterArray[8];
      const total = filterArray[9];
      const remaining = filterArray[10];
      const gender = filterArray[11];
      const paid = filterArray[12];
      const addressId = filterArray[13];
      const matchFilter = [];
      // Fetch data from row
      const columnName = row.name;
      const columnMobile = row.mobile;
      const columnAdultsCount = row.adultsCount;
      const columnChildrenCount = row.childrenCount;
      const columnTransportationId = row.transportationId;
      const columnBookingStatus = row.bookingStatus;
      const columnBirthDateMonth = row.birthDateMonth;
      const columnAge = row.age;
      const columnTotal = row.totalCost;
      const columnGender = row.gender;
      const columnPaid = row.paid;
      const columnAddress = row.addressId;
      // verify fetching data by our searching values
      const customFilterName = columnName.toLowerCase().includes(name);
      const customFilterMobile = columnMobile.includes(mobile);
      // We minus 1 for primary count
      const customFilterAdultsCount = adultsCount != 'null' ? +columnAdultsCount === (+adultsCount - 1) : true; 
      const customFilterChildrenCount = childrenCount != 'null' ? +columnChildrenCount === +childrenCount : true;
      const customFilterFromAge = fromAge != 'null' ? +columnAge >= +fromAge : true;
      const customFilterToAge = toAge != 'null' ? +columnAge <= +toAge : true;
      const customFilterTransportationId = transportationId != 'all' ? columnTransportationId === transportationId : true;
      const customFilterBirthDateMonth = birthDateMonth != 'null' ? +columnBirthDateMonth === +birthDateMonth : true;
      const customFilterBookingStatus = +bookingStatus != BookingStatus.all ? +columnBookingStatus === +bookingStatus : true;
      const customFilterGender = +gender != Gender.all ? +columnGender === +gender : true;
      const customFilterTotal = total != 'null' ? +columnTotal === +total : true;
      const customFilterPaid = paid != 'null' ? +columnPaid === +paid : true;
      const customFilterRemaining = remaining != 'null' ? +columnTotal - +columnPaid === +remaining : true;
      const customFilterAddressId = addressId != 'all' ? columnAddress === addressId : true;
      // push boolean values into array
      matchFilter.push(customFilterName);
      matchFilter.push(customFilterMobile);
      matchFilter.push(customFilterAdultsCount);
      matchFilter.push(customFilterChildrenCount);
      matchFilter.push(customFilterFromAge);
      matchFilter.push(customFilterToAge);
      matchFilter.push(customFilterTransportationId);
      matchFilter.push(customFilterBirthDateMonth);
      matchFilter.push(customFilterBookingStatus);
      matchFilter.push(customFilterGender);
      matchFilter.push(customFilterTotal);
      matchFilter.push(customFilterPaid);
      matchFilter.push(customFilterRemaining);
      matchFilter.push(customFilterAddressId);
      // return true if all values in array is true
      // else return false
      return matchFilter.every(Boolean);
    };
  }
}
