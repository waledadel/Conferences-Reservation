import { NgModule } from '@angular/core';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';

import { environment } from 'environments/environment';

const firebaseModules = [
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideFirestore(() => getFirestore()),
  AngularFireModule.initializeApp(environment.firebaseConfig),
];


@NgModule({
  imports: firebaseModules,
  exports: [firebaseModules]
})
export class FirebaseModule { }
