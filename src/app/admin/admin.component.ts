import { Component, ViewChild, AfterViewInit, OnInit, Inject, HostListener } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { Constants } from '@app/constants';
import { AdminModel } from './admin.models';
import { LanguageService, AuthService, StorageService } from '@app/services';
import { WINDOW } from 'app/shared/services/window.service';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer') drawer: MatDrawer;
  model: AdminModel = {} as AdminModel;

  constructor(
    private authService: AuthService,
    private LanguageService: LanguageService,
    private storageService: StorageService,
    @Inject(WINDOW) private window: Window
  ) {
    this.drawer = {} as MatDrawer;
  }

  @HostListener('window:resize', ['$event']) onResize() {
    this.detectMobileView();
  }

  ngOnInit(): void {
    this.initModel();
    const language = this.storageService.getItem(Constants.Languages.languageKey);
    if (language != null) {
      this.model.selectedLanguage = language;
    }
  }

  ngAfterViewInit(): void {
    if (!this.model.isMobileView) {
      this.drawer.opened = true;
    }
  }

  onItemClick(): void {
    if (this.model.isMobileView) {
      this.drawer.opened = false;
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
