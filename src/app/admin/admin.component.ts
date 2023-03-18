import { Constants } from '@app/constants';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { AdminModel } from './admin.models';
import { LanguageService, AuthService, StorageService } from '@app/services';

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
    private storageService: StorageService
  ) {
    this.drawer = {} as MatDrawer;
  }

  ngOnInit(): void {
    this.initModel();
    const language = this.storageService.getItem(Constants.Languages.languageKey);
    if (language != null) {
      this.model.selectedLanguage = language;
    }
  }

  ngAfterViewInit(): void {
    this.drawer.opened = true;
  }

  changeLanguage(lang: string): void {
    this.LanguageService.changeLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
  }

  private initModel(): void {
    this.model = new AdminModel();
  }
}
