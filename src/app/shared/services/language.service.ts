import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { TranslationService } from './translation.service';
import { Constants } from '@app/constants';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  readonly html: HTMLElement;
  private currentLanguage: string;

  get isArabic(): boolean {
    return this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
  }

  constructor(
    private translateService: TranslationService,
    private storageService: StorageService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.html = this.document.getElementsByTagName('html')[0];
    this.currentLanguage = this.storageService.getItem(Constants.Languages.languageKey) || Constants.Languages.ar;
  }

  initAppLanguage(): void {
    this.translateService.setDefaultLang(Constants.Languages.ar);
    this.applyChangeLanguage(this.currentLanguage);
  }

  changeLanguage(lang: string): void {
    if (this.currentLanguage !== lang) {
      this.applyChangeLanguage(lang);
      window.location.reload();
    }
  }

  private applyChangeLanguage(lang: string): void {
    this.translateService.use(lang);
    this.storageService.setItem(Constants.Languages.languageKey, lang);
    this.html.lang = lang;
    const currentDirection = (lang === Constants.Languages.ar) ? Constants.PageDirection.rtl : Constants.PageDirection.ltr;
    this.document.body.dir = this.html.dir = this.document.documentElement.dir = currentDirection;
  }
}
