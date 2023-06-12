import { KeyValue } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { BookingStatus, Gender, IAddress, IBus, MemberRoom } from '@app/models';

export class AdvancedSearchModel {
  form!: FormGroup;
  buses: Array<IBus> = [];
  addressList: Array<IAddress> = [];
  isMobileView = false;
  isAgePanelStateOpened = false;
  showPrimaryOptions = false;
  readonly genderList: Array<KeyValue<string, number>> = [
    {key: 'common.all', value: Gender.all},
    {key: 'common.male', value: Gender.male},
    {key: 'common.female', value: Gender.female},
  ];
  readonly bookingStatusList: Array<KeyValue<string, BookingStatus>> = [
    {key: 'common.all', value: BookingStatus.all},
    {key: 'bookingStatus.new', value: BookingStatus.new},
    {key: 'bookingStatus.confirmed', value: BookingStatus.confirmed},
    {key: 'bookingStatus.canceled', value: BookingStatus.canceled},
    {key: 'bookingStatus.duplicated', value: BookingStatus.duplicated},
    {key: 'bookingStatus.waiting', value: BookingStatus.waiting},
    {key: 'bookingStatus.deleted', value: BookingStatus.deleted},
  ];
  readonly months: KeyValue<string, number>[] = [
    { key: 'الكل', value: 0},
    { key: 'يناير', value: 1},
    { key: 'فبراير', value: 2},
    { key: 'مارس', value: 3},
    { key: 'أبريل', value: 4},
    { key: 'مايو', value: 5},
    { key: 'يونيو', value: 6},
    { key: 'يوليو', value: 7},
    { key: 'أغسطس', value: 8},
    { key: 'سبتمبر', value: 9},
    { key: 'أكتوبر', value: 10},
    { key: 'نوفمبر', value: 11},
    { key: 'ديسمبر', value: 12}
  ];
  readonly roomOptions: KeyValue<string, number>[] = [
    { key: 'الكل', value: MemberRoom.all},
    { key: 'مسكن', value: MemberRoom.hasRoom},
    { key: 'غير مسكن', value: MemberRoom.notHaveRoom}
  ];
  bookingStatus = BookingStatus;
}

export interface IAdvancedFilterForm {
  name: string;
  mobile: string;
  adultsCount: number;
  childrenCount: number;
  paid: number;
  total: number;
  remaining: number;
  transportationId: string;
  gender: Gender;
  bookingStatus: BookingStatus;
  birthDateMonth: number;
  fromAge: number;
  toAge: number;
  addressId: string;
  hasRoom: MemberRoom;
  hideDeleted: boolean;
}