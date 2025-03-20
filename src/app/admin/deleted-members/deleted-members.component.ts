import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { IDeletedMembersDataSourceVm } from '@app/models';
import { FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';
import { DeletedMembersModel } from './deleted-members.models';

@Component({
    templateUrl: './deleted-members.component.html',
    standalone: false
})
export class DeletedMembersComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  model: DeletedMembersModel;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }
  
  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(
    private fireStoreService: FireStoreService, 
    private adminService: AdminService
  ) {
    this.model = new DeletedMembersModel();
  }

  ngOnInit(): void {
    this.detectMobileView();
    this.adminService.updatePageTitle('المشتركين المحذوفين');
    this.getDeletedMembers();
  }

  private getDeletedMembers(): void {
    this.fireStoreService.getDeletedMembers().subscribe(res => {
      const data: Array<IDeletedMembersDataSourceVm> = res.map(item => ({
        ...item,
        mainMemberName: item.isMain ? '' : res.find(m => m.id === item.primaryId)?.name ?? ''
      }));
      this.model.dataSource = new MatTableDataSource(data);
      this.model.dataSource.sort = this.sort;
      this.model.total = data.length;
    });
  }

  private detectMobileView(): void {
    this.model.isMobileView = this.isMobile;
    if (this.model.isMobileView) {
      this.model.displayedColumns = ['mobileView'];
    } else {
      this.model.displayedColumns = this.model.desktopColumns;
    }
  }
}
