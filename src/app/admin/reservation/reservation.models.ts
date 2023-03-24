import { KeyValue } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';

import { Gender, IAddress, IBus, SocialStatus, BookingType, BookingStatus } from '@app/models';

export class ReservationModel {
  form: FormGroup;
  addressList: Array<IAddress> = [];
  busList: Array<IBus> = [];
  isArabic: boolean = true;
  maxDate: Date;
  adultMinDate: Date;
  childMinDate: Date;
  gender = Gender;
  socialStatus = SocialStatus;
  bookingType = BookingType;
  selectedType = BookingType.individual;
  isEditMode = false;
  bookingStatusList: Array<KeyValue<string, BookingStatus>> = [
    {key: 'bookingStatus.new', value: BookingStatus.new},
    {key: 'bookingStatus.confirmed', value: BookingStatus.confirmed},
    {key: 'bookingStatus.canceled', value: BookingStatus.canceled},
    {key: 'bookingStatus.duplicated', value: BookingStatus.duplicated},
  ];

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  constructor() {
    this.form = {} as FormGroup;
    const now = new Date();
    this.maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.adultMinDate = new Date(now.getFullYear() - 90, now.getMonth(), now.getDate());
    this.childMinDate = new Date(now.getFullYear() - 12, now.getMonth(), now.getDate());
  }
}