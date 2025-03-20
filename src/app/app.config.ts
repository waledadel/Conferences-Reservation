import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';

import { routes } from './app.routes';
import { environment } from 'environments/environment';
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { TranslationModule } from './shared/translation/translation.module';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    importProvidersFrom(AngularFireModule.initializeApp(environment.firebaseConfig)),
    provideAnimationsAsync(),
    importProvidersFrom(
      HttpClientModule,
      TranslationModule.forRoot(),
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
      })
    ),
    WINDOW_PROVIDERS
  ],
};
