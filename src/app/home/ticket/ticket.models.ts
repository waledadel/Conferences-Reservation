import { FormArray, FormGroup } from '@angular/forms';

import { Gender, IAddress, IBus, SocialStatus } from '@app/models';

export class TicketModel {
    form: FormGroup;
    addressList: Array<IAddress> = [];
    busList: Array<IBus> = [];
    isArabic: boolean = true;
    maxDate: Date;
    minDate: Date;
    gender = Gender;
    socialStatus = SocialStatus;
  
    get adults(): FormArray {
      return this.form.get('adults') as FormArray;
    }
  
    get children(): FormArray {
      return this.form.get('children') as FormArray;
    }

    constructor() {
        this.form = {} as FormGroup;
        const now = new Date();
        this.maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        this.minDate = new Date(now.getFullYear() - 90, now.getMonth(), now.getDate());
    }
}