import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { BookingStatus, Gender, IAddress, IAllSubscriptionDataSourceVm, IBus, IRoom, IRoomDataSource, MemberRoom } from '@app/models';
import { DialogService, FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';
import { IAdvancedFilterForm } from '../advanced-search/advanced-search.models';
import { ExportMembersComponent, IExportMembers } from '../export-members/export-members.component';
import { AllSubscriptionModel } from './all-subscription.models';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { AddRoomToMemberComponent } from './add-room-to-member/add-room-to-member.component';

@Component({
  templateUrl: './all-subscription.component.html'
})
export class AllSubscriptionComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  model: AllSubscriptionModel;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(
    private fireStoreService: FireStoreService, 
    private adminService: AdminService,
    private dialogService: DialogService
  ) {
    this.model = new AllSubscriptionModel();
  }

  ngOnInit(): void {
    this.detectMobileView();
    this.getBuses();
    this.getRooms();
    this.getAddress();
    this.adminService.updatePageTitle('كل المشتركين');
  }
  
  openExportModal(): void {
    this.dialogService.openAddEditDialog(ExportMembersComponent, 'lg', true, false)
    .afterClosed().subscribe((res: {exportData: boolean, options: Array<IExportMembers>}) => {
      if (res && res.exportData && res.options.filter(o => o.isChecked).length > 0) {
        let exportData: Array<any> = [];
        const selectedColumns = res.options.filter(op => op.isChecked);
        const dataSource = this.model.filteredData.length > 0 ? this.model.filteredData : this.model.dataSource.data;
        dataSource.filter(m => m.bookingStatus != BookingStatus.deleted).forEach(item => {
          let keyField: keyof IAllSubscriptionDataSourceVm;
          let exportObj = {} as any;
          for (const key in item) {
            keyField = key as keyof IAllSubscriptionDataSourceVm;
            const selectedOption = selectedColumns.find(c => c.columnName === keyField);
            if (selectedOption) {
              const genderField: keyof IAllSubscriptionDataSourceVm = 'gender';
              const bookingStatusField: keyof IAllSubscriptionDataSourceVm = 'bookingStatus';
              const birthDateField: keyof IAllSubscriptionDataSourceVm = 'birthDate';
              if (keyField === genderField) {
                exportObj[selectedOption.key] = item[keyField] === Gender.female ? 'أنثي' : 'ذكر';
              } else if (keyField === birthDateField) {
                exportObj[selectedOption.key] = item[keyField].toDate();
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
        this.adminService.exportAsExcelFile(exportData, 'كل المشتركين');
      }
    });
  }

  showAdvancedFilter(): void {
    const filter = this.model.previousFilter != null ? this.model.previousFilter : null;
    this.dialogService.openAddEditDialog(AdvancedSearchComponent, 'lg', true, filter)
    .afterClosed().subscribe((res: IAdvancedFilterForm) => {
      if (res) {
        this.model.previousFilter = res;
        const name = res.name
        const mobile = res.mobile;
        const transportationId = res.transportationId;
        const bookingStatus = res.bookingStatus;
        const birthDateMonth = res.birthDateMonth;
        const fromAge = res.fromAge;
        const toAge = res.toAge;
        const gender = res.gender;
        const addressId = res.addressId;
        const hasRoom = res.hasRoom;
        const hideDeleted = res.hideDeleted;
        // create string of our searching values and split if by '$'
        const filterValue = `${name}$${mobile}$${transportationId}$${bookingStatus}$${birthDateMonth}$${fromAge}$${toAge}$${gender}$${addressId}$${hasRoom}$${hideDeleted}`;
        this.model.dataSource.filter = filterValue.trim();
        this.model.total = this.model.dataSource.filteredData.length;
        this.model.filteredData = this.model.dataSource.filteredData;
      }
    });
  }

  addRoomToMember(item: IAllSubscriptionDataSourceVm): void {
    this.dialogService.openAddEditDialog(AddRoomToMemberComponent, 'lg', true, {
      data: item,
      rooms: this.model.rooms
    }).afterClosed()
    .subscribe((res: {fireRefresh: boolean, roomId: string}) => {
      if (res && res.fireRefresh && res.roomId != '') {
        this.getUpdatedRoom(item, res.roomId);
      }
    });
  }

  private updateTableRows(item: IAllSubscriptionDataSourceVm, roomId: string): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.tickets}/${item.id}`).subscribe((res: IAllSubscriptionDataSourceVm) => {
      if (res) {
        const memberIndex = this.model.dataSource.data.findIndex(t => t.id === item.id);
        if (memberIndex > -1) {
          this.model.dataSource.data[memberIndex] = {
            ...item,
            roomId: res.roomId,
            displayedRoomName: this.getRoomNameById(res.roomId),
          };
          // Update displayed rows with the same room after increase or decrease available beds
          const rowsWzSameRoom = this.model.dataSource.data.filter(m => m.roomId === roomId);
          if (rowsWzSameRoom && rowsWzSameRoom.length > 0) {
            rowsWzSameRoom.forEach(row => {
              const rowIndex = this.model.dataSource.data.findIndex(t => t.id === row.id);
              if (rowIndex > -1) {
                this.model.dataSource.data[rowIndex] = {
                  ...row,
                  displayedRoomName: this.getRoomNameById(roomId)
                };
              }
            });
          }
          this.model.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  private getAddress(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.model.addressList = data;
      this.getTickets();
    });
  }

  private getTickets(): void {
    this.fireStoreService.getAllSubscription().subscribe(res => {
      const data: Array<IAllSubscriptionDataSourceVm> = res.map(item => ({
        ...item,
        address: this.getAddressById(item.addressId),
        transportationName: this.getBusNameById(item.transportationId),
        displayedRoomName: this.getRoomNameById(item.roomId),
        mainMemberName: item.isMain ? '' : res.find(m => m.id === item.primaryId)?.name ?? ''
      }));
      this.model.dataSource = new MatTableDataSource(data);
      this.model.dataSource.sort = this.sort;
      this.model.total = data.filter(m => m.bookingStatus != BookingStatus.deleted).length;
      this.model.dataSource.filterPredicate = this.getFilterPredicate();
    });
  }

  private getAddressById(addressId: string): string {
    if (addressId && this.model.addressList.length > 0) {
      const address = this.model.addressList.find(a => a.id === addressId);
      if (address) {
        return address.name;
      }
      return '';
    }
    return '';
  }

  private detectMobileView(): void {
    this.model.isMobileView = this.isMobile;
    if (this.model.isMobileView) {
      this.model.displayedColumns = ['mobileView'];
    } else {
      this.model.displayedColumns = this.model.desktopColumns;
    }
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.buses = data;
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

  private getRoomNameById(id: string): string {
    if (id && this.model.rooms.length > 0) {
      const room = this.model.rooms.find(b => b.id === id);
      if (room) {
        return room.displayedName;
      }
      return '';
    }
    return '';
  }

  private getRooms(): void {
    this.fireStoreService.getAll<IRoom>(Constants.RealtimeDatabase.rooms).subscribe(data => {
      if (data && data.length > 0) {
        this.model.rooms = data.sort((a,b) => a.room - b.room).map(r => ({
          ...r,
          displayedName: `R:${r.room}_S:(${r.sizeName})_B:${r.building}_F:${r.floor}_A:${r.available}`,
          size: this.getRoomCountSize(r.sizeName),
        }));
      }
    });
  }

  private getRoomCountSize(sizeName: string): number {
    let roomSize = 0;
    if (sizeName.toString().includes('+')) {
      const list = sizeName.split('+');
      roomSize = list.reduce((accumulator, currentValue) => accumulator + (+currentValue), 0);
    } else {
      roomSize = (+sizeName);
    }
    return roomSize;
  }

  private getUpdatedRoom(item: IAllSubscriptionDataSourceVm, roomId: string): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.rooms}/${roomId}`).subscribe((res: IRoomDataSource) => {
      if (res) {
        const index = this.model.rooms.findIndex(r => r.id === res.id);
        if (index > -1) {
          this.model.rooms[index] = {
            ...res,
            displayedName: `R:${res.room}_S:(${res.sizeName})_B:${res.building}_F:${res.floor}_A:${res.available}`,
            size: this.getRoomCountSize(res.sizeName),
          };
          this.updateTableRows(item, roomId);
        }
      }
    });
  }

  getFilterPredicate(): ((data: IAllSubscriptionDataSourceVm, filter: string) => boolean) {
    return (row: IAllSubscriptionDataSourceVm, filters: string) => {
      // split string per '$' to array
      const filterArray = filters.split('$');
      const name = filterArray[0];
      const mobile = filterArray[1];
      const transportationId = filterArray[2];
      const bookingStatus = filterArray[3];
      const birthDateMonth = filterArray[4];
      const fromAge = filterArray[5];
      const toAge = filterArray[6];
      const gender = filterArray[7];
      const addressId = filterArray[8];
      const hasRoom = filterArray[9];
      const hideDeleted = filterArray[10];
      const matchFilter = [];
      // Fetch data from row
      const columnName = row.name;
      const columnMobile = row.mobile;
      const columnTransportationId = row.transportationId;
      const columnBookingStatus = row.bookingStatus;
      const columnBirthDateMonth = row.birthDateMonth;
      const columnAge = row.age;
      const columnGender = row.gender;
      const columnAddress = row.addressId;
      const columnHasRoom = row.roomId;
      // verify fetching data by our searching values
      const customFilterName = columnName.toLowerCase().includes(name);
      const customFilterMobile = columnMobile.toLowerCase().includes(mobile);
      // We minus 1 for primary count
      const customFilterFromAge = fromAge != 'null' ? +columnAge >= +fromAge : true;
      const customFilterToAge = toAge != 'null' ? +columnAge <= +toAge : true;
      const customFilterTransportationId = transportationId != 'all' ? columnTransportationId === transportationId : true;
      const customFilterBirthDateMonth = +birthDateMonth > 0 ? +columnBirthDateMonth === +birthDateMonth : true;
      const customFilterBookingStatus = +bookingStatus != BookingStatus.all ? +columnBookingStatus === +bookingStatus : true;
      const customFilterGender = +gender != Gender.all ? +columnGender === +gender : true;
      const customFilterAddressId = addressId != 'all' ? columnAddress === addressId : true;
      const customFilterHideDeleted = hideDeleted == 'true' ? row.bookingStatus != BookingStatus.deleted : true;
      let customFilterHasRoom = true;
      if (+hasRoom === MemberRoom.all) {
        customFilterHasRoom = true;
      } else if (+hasRoom === MemberRoom.hasRoom) {
        customFilterHasRoom = columnHasRoom !== '';
      } else {
        customFilterHasRoom = columnHasRoom === '';
      }
      // push boolean values into array
      matchFilter.push(customFilterName);
      matchFilter.push(customFilterMobile);
      matchFilter.push(customFilterFromAge);
      matchFilter.push(customFilterToAge);
      matchFilter.push(customFilterTransportationId);
      matchFilter.push(customFilterBirthDateMonth);
      matchFilter.push(customFilterBookingStatus);
      matchFilter.push(customFilterGender);
      matchFilter.push(customFilterAddressId);
      matchFilter.push(customFilterHasRoom);
      matchFilter.push(customFilterHideDeleted);
      // return true if all values in array is true
      // else return false
      return matchFilter.every(Boolean);
    };
  }
}
