import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translateService: TranslateService) { }

  instant(key: string | Array<string>, interpolateParams?: Object): string | any {
    return this.translateService.instant(key, interpolateParams);
  }

  use(lang: string): Observable<any> {
    return this.translateService.use(lang);
  }

  setDefaultLang(lang: string): void {
    this.translateService.setDefaultLang(lang);
  }
}
