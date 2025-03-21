import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Constants } from '@app/constants';
import { FireStoreService } from '@app/services';
import { AdminService } from '../admin.service';
import { DeletedMembersModel } from './deleted-members.models';
import { SharedModule } from 'app/shared/shared.module';
import { AdvancedSearchModule } from '../advanced-search/advanced-search.module';
import { ExportMembersModule } from '../export-members/export-members.module';

@Component({
  templateUrl: './deleted-members.component.html',
  imports: [ SharedModule, AdvancedSearchModule, ExportMembersModule]
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

  private readonly fireStoreService = inject(FireStoreService);
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.initModel();
    this.detectMobileView();
    this.adminService.updatePageTitle('المشتركين المحذوفين');
    this.getDeletedMembers();
  }

  private initModel(): void {
    this.model = new DeletedMembersModel();
  }

  private getDeletedMembers(): void {
    this.fireStoreService.getDeletedMembers().subscribe(res => {
      this.model.dataSource = new MatTableDataSource(res);
      this.model.dataSource.sort = this.sort;
      this.model.total = res.length;
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
