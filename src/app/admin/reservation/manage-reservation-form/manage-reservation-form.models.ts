import { KeyValue } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';

import { Gender, IAddress, IBus, SocialStatus, BookingType, BookingStatus } from '@app/models';
import { RoomType } from 'app/shared/models/ticket';

export class ManageReservationFormModel {
  readonly gender = Gender;
  readonly bookingType = BookingType;
  readonly socialStatus = SocialStatus;
  readonly roomType = RoomType;
  form: FormGroup;
  addressList: Array<IAddress> = [];
  busList: Array<IBus> = [];
  isArabic = true;
  maxDate: Date;
  adultMinDate: Date;
  childMinDate: Date;
  isLoading = false;
  remaining = 0;
  totalCost = 0;
  idsNeedToRemoved: Array<string> = [];
  showEditMessage = false;
  bookingStatusList: Array<KeyValue<string, BookingStatus>> = [
    {key: 'bookingStatus.new', value: BookingStatus.new},
    {key: 'bookingStatus.confirmed', value: BookingStatus.confirmed},
    {key: 'bookingStatus.canceled', value: BookingStatus.canceled},
    {key: 'bookingStatus.duplicated', value: BookingStatus.duplicated},
    {key: 'bookingStatus.deleted', value: BookingStatus.deleted},
  ];
  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }
  get children(): FormArray {
    return this.form.get('children') as FormArray;
  }

  constructor() {
    this.form = {} as FormGroup;
    const now = new Date();
    this.maxDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.adultMinDate = new Date(now.getFullYear() - 90, now.getMonth(), now.getDate());
    this.childMinDate = new Date(now.getFullYear() - 4, now.getMonth(), now.getDate());
  }
}
