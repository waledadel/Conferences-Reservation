import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { ISettings } from '@app/models';
import { Constants } from '@app/constants';
import { FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';
import { SettingsModel } from './settings.models';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  model: SettingsModel;

  constructor(
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private angularFireStorage: AngularFireStorage
  ) {
    this.model = new SettingsModel();
    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    this.setEditorOptions();
    this.getSavedSettings();
  }

  onSelectedImage(selectedFile: any): void {
    const file: File = selectedFile.files[0];
    this.uploadImage(file);
  }

  save(): void {
    if (this.model.form.valid) {
      if (this.model.savedSettings.id != null) {
        this.update();
      } else {
        this.add();
      }
    }
  }

  deleteImage(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.settings}/${this.model.savedSettings.id}`, {
      ...formValue, imageUrl: '', imageName: ''
    }).subscribe(() => {
      const storageRef = this.angularFireStorage.ref('Images/');
      storageRef.child(formValue.imageName).delete().subscribe(() => {
        this.model.selectedImage = Constants.Images.defaultSettingImg;
        this.notifyService.showNotifier(this.translationService.instant('notifications.settingsSavedSuccessfully'));
      });
    });
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addDoc<ISettings>(Constants.RealtimeDatabase.settings, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.settingsSavedSuccessfully'));
    });
  }

  private update(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.settings}/${this.model.savedSettings.id}`, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.settingsSavedSuccessfully'));
    });
  }

  private initFormModels() {
    return this.formBuilder.group({
      title: ['', Validators.required],
      imageUrl: ['', Validators.required],
      imageName: ['', Validators.required],
      generalAlerts: ['', Validators.required],
      priceDetails: ['', Validators.required],
      importantDates: ['', Validators.required],
      startReservationDate: [null, Validators.required],
      endReservationDate: [null, Validators.required],
      reservationPrice: [null, [Validators.required, Validators.min(1)]],
      waitingListCount: [null, [Validators.required, Validators.min(1)]],
      availableTicketsCount: [null, [Validators.required, Validators.min(1)]],
      waitingListMessage: ['', Validators.required],
      welcomeMessage: ['', Validators.required],
    });
  }

  private setEditorOptions(): void {
    this.model.toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      // ['code', 'blockquote'],
      // [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['ordered_list', 'bullet_list'],
      // ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
  }

  private async uploadImage(file: File): Promise<void> {
    const filePath = `Images/${file.name}`;
    const storageRef = this.angularFireStorage.ref(filePath);
    const task = this.angularFireStorage.upload(filePath, file,  {
      cacheControl: 'max-age=2592000,public'
    });
    task.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(url => {
          if (url) {
            this.model.form.patchValue({
              imageUrl: url,
              imageName: file.name
            });
            this.model.selectedImage = url;
          }
        });
      }),
    ).subscribe();
  }

  private getSavedSettings(): void {
    this.fireStoreService.getAll<ISettings>(Constants.RealtimeDatabase.settings).subscribe(data => {
      if (data && data.length === 1) {
        this.patchFormValue(data[0]);
        this.model.savedSettings = data[0];
      }
    });
  }

  private patchFormValue(item: ISettings): void {
    this.model.form.patchValue({
      title: item.title,
      imageName: item.imageName,
      imageUrl: item.imageUrl,
      generalAlerts: item.generalAlerts,
      priceDetails: item.priceDetails,
      importantDates: item.importantDates,
      startReservationDate: item.startReservationDate.toDate(),
      endReservationDate: item.endReservationDate.toDate(),
      reservationPrice: item.reservationPrice,
      waitingListCount: item.waitingListCount,
      availableTicketsCount: item.availableTicketsCount,
      waitingListMessage: item.waitingListMessage,
      welcomeMessage: item.welcomeMessage
    });
    if (item.imageUrl != '') {
      this.model.selectedImage = item.imageUrl;
    }
  }
}
