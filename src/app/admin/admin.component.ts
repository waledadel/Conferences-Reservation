import { Component, OnInit, Inject, HostListener, viewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { Constants } from '@app/constants';
import { AdminModel, menuItems } from './admin.models';
import { LanguageService, AuthService, StorageService } from '@app/services';
import { WINDOW } from 'app/shared/services/window.service';
import { AdminService } from './admin.service';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  model: AdminModel;
  readonly drawer = viewChild.required<MatDrawer>('drawer');

  constructor(
    private authService: AuthService,
    private LanguageService: LanguageService,
    private storageService: StorageService,
    private adminService: AdminService,
    @Inject(WINDOW) private window: Window
  ) {
  }

  @HostListener('window:resize', ['$event']) onResize() {
    this.detectMobileView();
  }

  ngOnInit(): void {
    this.initModel();
    this.detectMobileView();
    const role = this.storageService.getItem('role');
    if (role) {
      this.model.menuItems = menuItems.filter(m => m.roles.includes(+role));
    }
    this.adminService.title.subscribe(res => {
      this.model.pageTitle = res;
    });
  }

  onItemClick(): void {
    if (this.model.isMobileView) {
      this.drawer().opened = false;
    }
  }

  changeLanguage(lang: string): void {
    this.onItemClick();
    this.LanguageService.changeLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
  }

  private initModel(): void {
    this.model = new AdminModel();
    this.detectMobileView();
  }
  
  private detectMobileView(): void {
    this.model.isMobileView = this.window.innerWidth < Constants.ScreenWidth.tabletView;
  }
}
