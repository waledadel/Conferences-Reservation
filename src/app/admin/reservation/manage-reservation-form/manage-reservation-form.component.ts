import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { timer } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { ManageReservationFormModel } from './manage-reservation-form.models';
import { Gender, SocialStatus, BookingStatus, BookingType, IAddress, IBus, ITicket } from '@app/models';
import { DialogService, FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';
import { RoomType } from 'app/shared/models/ticket';
import { ReservationUtilityService } from 'app/utils/reservation-utility.service';

@Component({
  selector: 'app-manage-reservation-form',
  templateUrl: './manage-reservation-form.component.html',
  styleUrls: ['./manage-reservation-form.component.scss'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill', floatLabel: 'always' }
    }
  ]
})
export class ManageReservationFormComponent implements OnInit {

  @Input() isAdmin = false;
  @Input() enableWaitingList = false;
  @Input() isEditMode = false;
  @Input() set roomType(val: RoomType) {
    this.model.form.patchValue({ roomType: val });
    const maximum = val - 1;
    const canUpdate = this.isEditMode && this.isAdmin && this.reservationData.length > 0;
    let max = maximum;
    if (canUpdate) {
      const adults = this.reservationData.filter(c => new Date().getFullYear() - c.birthDate.toDate().getFullYear() >= 8 );
      max = adults.length - 1;
    }
    this.model.showEditMessage = max !== maximum;
    if ((val > 1) || canUpdate) {
      Array.from({ length: max }).forEach(() => {
        this.addAdult();
      });
    }
  }
  @Input() reservationData: Array<ITicket> = [];
  @Input() set bookingType (val: BookingType) {
    this.model.form.patchValue({
      bookingType: val
    });
  }
  @Output() bookingDone = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  model: ManageReservationFormModel;

  constructor(
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private dialogService: DialogService,
    private reservationUtilityService: ReservationUtilityService
  ) {
    this.model = new ManageReservationFormModel();

    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    this.getBusList();
    this.getAddressList();
  }

  addAdult(): void {
    this.model.participants.push(this.newParticipant());
  }

  removeParticipant(index: number): void {
    const text = this.translationService.instant('common.individual');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${text}: ${index + 1}`))
    .afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        if (this.isAdmin) {
          const id = this.model.participants.at(index).value.id;
          this.model.idsNeedToRemoved.push(id);
        }
        this.model.participants.removeAt(index);
      }
    });
  }

  addChild(): void {
    this.model.children.push(this.newChild());
  }

  removeChild(index: number): void {
    const text = this.translationService.instant('common.child');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${text}: ${index + 1}`))
    .afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        if (this.isAdmin) {
          const id = this.model.children.at(index).value.id;
          this.model.idsNeedToRemoved.push(id);
        }
        this.model.children.removeAt(index);
      }
    });
  }

  save(): void {
    if (this.model.form.valid) {
      const isGrouping = this.model.form.value.bookingType === BookingType.group;
      if (this.isEditMode && this.isAdmin) {
        this.update();
      } else {
        this.dialogService.openConfirmBookingDialog(isGrouping).afterClosed().subscribe((res: {confirmBooking: boolean}) => {
          if (res && res.confirmBooking) {
            this.model.isLoading = true;
            this.add();
          } else {
            this.model.isLoading = false;
          }
        });
      }
    }
  }

  private newParticipant(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      transportationId: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      userNotes: [''],
      addressId: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(Constants.Regex.mobileNumber)]],
      socialStatus: [SocialStatus.single, Validators.required],
    });
  }

  private newChild(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required]
    });
  }

  private add(): void {
    if (this.enableWaitingList) {
      this.model.form.patchValue({
        bookingStatus: BookingStatus.waiting
      });
    }
    const formValue = this.model.form.value;
    this.fireStoreService.addTicket(formValue).subscribe(() => {
      this.bookingDone.emit();
      this.dialogService.openSuccessfullyBookingDialog();
      this.model.form.reset();
      this.model.isLoading = false;
    });
  }

  private update(): void {
    const formValue = this.model.form.value;
    const maximum = this.model.form.value.roomType - 1;
    const adults = this.model.form.value.participants.length;
    this.model.showEditMessage = adults !== maximum;
    if (this.model.showEditMessage) {
      timer(100).subscribe(() => this.scrollToElement('editMessage'));
    }
    if (this.isEditMode && this.isAdmin && this.canUpdate()) {
      this.model.isLoading = true;
      this.fireStoreService.updateTicket(formValue, this.model.idsNeedToRemoved).subscribe(() => {
        this.closeModal.emit();
        this.notifyService.showNotifier(this.translationService.instant('notifications.bookedUpdatedSuccessfully'));
        this.model.form.reset();
        this.model.isLoading = false;
      });
    }
  }

  private getAddressList(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.model.addressList = data.sort((a, b) => a.name > b.name ? 1 : -1);
    });
  }

  private getBusList(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.busList = data;
      this.patchFormValue();
    });
  }

  private initFormModels() {
    return this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      mobile: ['', [Validators.required, Validators.pattern(Constants.Regex.mobileNumber)]],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      socialStatus: [SocialStatus.single, Validators.required],
      addressId: ['', Validators.required],
      transportationId: ['', Validators.required],
      bookingDate: [Timestamp.fromDate(new Date())],
      adminNotes: [''],
      userNotes: [''],
      total: [0],
      paid: [0, [Validators.required, Validators.min(0)]],
      bookingStatus: [BookingStatus.new],
      bookingType: [BookingType.individual, Validators.required],
      roomId: [''],
      roomType: [RoomType.single, Validators.required],
      participants: this.formBuilder.array([]),
      children: this.formBuilder.array([])
    });
  }

  private patchFormValue(): void {
    if (this.reservationData && this.reservationData.length > 0) {
      const primary = this.reservationData.find(m => m.isMain);
      const allParticipants = this.reservationData.filter(p => !p.isMain && new Date().getFullYear() - p.birthDate.toDate().getFullYear() >= 8);
      const allChildren = this.reservationData.filter(p => !p.isMain && new Date().getFullYear() - p.birthDate.toDate().getFullYear() <= 4);
      if (primary && primary != null) {
        const totalCost = this.getTotalCost();
        this.model.form.patchValue({
          id: primary.id,
          name: primary.name,
          mobile: primary.mobile,
          birthDate: new Date(primary.birthDate.toMillis()),
          gender: primary.gender,
          socialStatus: primary.socialStatus,
          addressId: primary.addressId,
          transportationId: primary.transportationId,
          bookingDate: primary.bookingDate,
          adminNotes: primary.adminNotes,
          userNotes: primary.userNotes,
          total: totalCost,
          paid: primary.paid,
          bookingStatus: primary.bookingStatus,
          // bookingType: primary.bookingType,
          roomId: primary.roomId,
          participants: [],
          children: [],
          // roomType: primary.roomType
        });
        this.model.totalCost = totalCost;
        this.model.remaining = primary.paid ? totalCost - primary.paid : totalCost;
      }
      if (allParticipants.length > 0) {
        this.model.form.patchValue({
          participants: allParticipants.map(item => ({...item, birthDate: new Date(item.birthDate.toMillis())}))
        });
      }
      if (allChildren.length > 0 && this.model.form.value.roomType !== RoomType.single) {
        allChildren.forEach(() => this.addChild());
        this.model.form.patchValue({
          children: allChildren.map(item => ({...item, birthDate: new Date(item.birthDate.toMillis())}))
        });
      }
    }
  }

  private getTotalCost(): number {
    if (this.reservationData.length > 0) {
      let adultCost = 0;
      let primaryCost = 0;
      let childrenCost = 0;
      const primary = this.reservationData.find(m => m.isMain);
      const price = primary ? this.reservationUtilityService.getReservationPrice(primary.roomType) : 0;
      if (primary) {
        primaryCost = this.getTransportPrice(primary.transportationId) + price;
        const adults = this.reservationData.filter(c => !c.isMain && new Date().getFullYear() - c.birthDate.toDate().getFullYear() >= 8);
        const childrenMoreThenFour = this.reservationData.filter(c => !c.isMain && new Date().getFullYear() - c.birthDate.toDate().getFullYear() > 4 &&  
          new Date().getFullYear() - c.birthDate.toDate().getFullYear() < 8);
        if (adults && adults.length > 0) {
          adults.forEach(adult => {
            const transportPrice = this.getTransportPrice(adult.transportationId);
            adultCost += (transportPrice + price);
          });
        }
        if (childrenMoreThenFour && childrenMoreThenFour.length > 0) { 
          childrenMoreThenFour.forEach(() => {
            const transportPrice = this.getTransportPrice(primary.transportationId);
            childrenCost += (transportPrice + (0.5 * price));
          });
        }
        return primaryCost + adultCost + childrenCost;
      }
      return 0;
    }
    return 0;
  }

  private getTransportPrice(transportId: string): number {
    if (transportId && this.model.busList.length > 0) {
      const bus = this.model.busList.find(b => b.id === transportId);
      return bus ? +bus.price : 0;
    }
    return 0;
  }

  private canUpdate(): boolean {
    const formValue = this.model.form.value;
    const roomType = this.model.form.value.roomType;
    const adults = formValue.participants.length;
    const children = formValue.children.length;
    switch (roomType) {
      case RoomType.double:
        return adults === 1;
      case RoomType.triple:
        return adults === 2;
      case RoomType.quad:
        return adults === 3;
      default:
        return adults === 0 && children === 0;
    }
  }

  private scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }
  }
}
