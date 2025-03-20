import { Component, OnInit } from '@angular/core';
// import { MatDialogModule } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        RouterOutlet,
        // MatDialogModule
        // BrowserModule,
        // BrowserAnimationsModule,
        // HttpClientModule,
        // TranslationModule.forRoot(),
        // FirebaseModule,
        // MatDialogModule,
        // MatSnackBarModule,
        // MatSelectModule,
        // MatNativeDateModule,
        // MatDatepickerModule,
        // ServiceWorkerModule.register('ngsw-worker.js', {
        //   enabled: !isDevMode(),
        //   // Register the ServiceWorker as soon as the application is stable
        //   // or after 30 seconds (whichever comes first).
        //   registrationStrategy: 'registerWhenStable:30000'
        // })
    ]
})
export class AppComponent implements OnInit {

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    console.log('AppComponent ngOnInit');
    this.languageService.initAppLanguage();
  }
}
