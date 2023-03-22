import { Injectable } from '@angular/core';
import { catchError, concatMap, last, tap, throwError } from 'rxjs';

import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})


export class FireStorageService {

    constructor(private angularFireStorage: AngularFireStorage) {}

    async uploadImage(image: string): Promise<void> {
        const response = await fetch(image);
        const blob = await response.blob();
        const filePath = `Images/${new Date().getTime()}`;
        const task = this.angularFireStorage.upload(filePath, blob, {
            cacheControl: 'max-age=2592000,public'
        });
        task.snapshotChanges().pipe(last(),
            concatMap(() => this.angularFireStorage.ref(filePath).getDownloadURL()),
            tap(url => {
                // this.selectedImage = url;
                // this.imgChange.emit(url);
            }),
            catchError(err => {
                console.log('Could not create image url', err);
                return throwError(err);
            })
        ).subscribe();
    }
}