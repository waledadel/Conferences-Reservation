import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroupDirective } from '@angular/forms';

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
    private translationService: TranslationService
  ) {
    this.model = new SettingsModel();
    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
  }

  save(form: FormGroupDirective): void {
    console.log('save', this.model.form.value);
    if (this.model.form.valid) {
      this.add();
    }
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addDoc<ISettings>(Constants.RealtimeDatabase.settings, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.settingsSavedSuccessfully'));
    });
  }

  private initFormModels() {
    return this.formBuilder.group({
      title: ['', Validators.required],
      image: ['', Validators.required],
      generalAlerts: ['', Validators.required],
      priceDetails: ['', Validators.required],
      importantDates: ['', Validators.required],
      firstReservationDate: [new Date(), Validators.required],
      lastReservationDate: [new Date(), Validators.required],
    });
  }

}
