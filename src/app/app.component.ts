import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LanguageService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [ RouterOutlet ]
})
export class AppComponent implements OnInit {

  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    this.languageService.initAppLanguage();
  }
}
