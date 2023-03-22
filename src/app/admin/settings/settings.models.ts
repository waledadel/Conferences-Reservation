import { FormGroup } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';

import { ISettings } from '@app/models';
import { Constants } from '@app/constants';

export class SettingsModel {
  form: FormGroup;
  isArabic: boolean = true;
  minDate: Date;
  generalAlertsEditor: Editor;
  priceDetailsEditor: Editor;
  importantDatesEditor: Editor;
  selectedImage: string;
  toolbar: Toolbar;
  savedSettings: ISettings;

  constructor() {
    this.form = {} as FormGroup;
    this.minDate = new Date();
    this.generalAlertsEditor = new Editor();
    this.priceDetailsEditor = new Editor();
    this.importantDatesEditor = new Editor();
    this.selectedImage = Constants.Images.defaultSettingImg;
    this.toolbar = [];
    this.savedSettings = {} as ISettings;
  }
}