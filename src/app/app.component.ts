import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.initAppLanguage();
  }
}
