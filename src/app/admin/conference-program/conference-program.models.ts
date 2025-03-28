import { FormGroup } from '@angular/forms';

import { Constants } from '@app/constants';
import { signal } from '@angular/core';

export class ConferenceProgramModel {
  form: FormGroup;
  program = signal<IConferenceProgram>({
    id: '',
    locationUrl: '',
    imageUrl: ''
  });
  selectedImage = signal(Constants.Images.defaultSettingImg);
  isLoading = signal(false);
}

export interface IConferenceProgram {
  id: string;
  locationUrl: string;
  imageUrl: string;
}