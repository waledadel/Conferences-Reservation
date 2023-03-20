import { FormArray, FormGroup } from '@angular/forms';

import { Gender, IAddress, IBus, SocialStatus, TicketType } from '@app/models';

export class TicketModel {
    form: FormGroup;
    addressList: Array<IAddress> = [];
    busList: Array<IBus> = [];
    isArabic: boolean = true;
    maxDate: Date;
    adultMinDate: Date;
    childMinDate: Date;
    gender = Gender;
    socialStatus = SocialStatus;
    ticketType = TicketType;
  
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
        this.adultMinDate = new Date(now.getFullYear() - 90, now.getMonth(), now.getDate());
        this.childMinDate = new Date(now.getFullYear() - 12, now.getMonth(), now.getDate());
    }
}