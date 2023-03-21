import { FormGroup } from '@angular/forms';

export class SettingsModel {
  form: FormGroup;
  isArabic: boolean = true;
  minDate: Date;

  constructor() {
    this.form = {} as FormGroup;
    this.minDate = new Date();
  }
}