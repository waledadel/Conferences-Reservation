import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { ManageReservationFormModel } from './manage-reservation-form.models';
import { Gender, SocialStatus, BookingStatus, BookingType, IAddress, IBus, ITicket } from '@app/models';
import { DialogService, FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';
import { RoomType } from 'app/shared/models/ticket';

@Component({
  selector: 'app-manage-reservation-form',
  templateUrl: './manage-reservation-form.component.html',
  styleUrls: ['./manage-reservation-form.component.scss']
})
export class ManageReservationFormComponent implements OnInit {

  @Input() canManageReservation = false;
  @Input() enableWaitingList = false;
  @Input() set roomType(val: RoomType) {
    this.model.form.patchValue({ roomType: val });
    if (val > 1) {
      Array.from({ length: val - 1 }).forEach(element => {
        this.addAdult();
      });
    }
  }
  @Input() reservationData: Array<ITicket> = [];
  @Input() set type (val: BookingType) {
    this.model.form.patchValue({
      bookingType: val
    });
  }
  @Input() set fireSaveAction (update: boolean) {
    if (update) {
      this.model.isEditMode = true;
      this.save();
    }
  }
  @Output() showForm: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  model: ManageReservationFormModel;

  constructor(
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private dialogService: DialogService
  ) {
    this.model = new ManageReservationFormModel();
    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    this.getBusList();
    this.patchFormValue();
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
        if (this.canManageReservation) {
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
        if (this.canManageReservation) {
          const id = this.model.children.at(index).value.id;
          this.model.idsNeedToRemoved.push(id);
        }
        this.model.children.removeAt(index);
      }
    });
  }

  save(): void {
    if (this.model.form.valid) {
      if (this.model.isEditMode) {
        this.update();
      } else {
        const isGrouping = this.model.form.value.bookingType === BookingType.group;
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
      this.showForm.emit(false);
      this.dialogService.openSuccessfullyBookingDialog();
      this.model.form.reset();
      this.model.isLoading = false;
    });
  }

  private update(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateTicket(formValue, this.model.idsNeedToRemoved).subscribe(() => {
      this.closeModal.emit(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedUpdatedSuccessfully'));
      this.model.form.reset();
      this.model.isLoading = false;
    });
  }

  private getAddressList(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.model.addressList = data.sort((a, b) => a.name > b.name ? 1 : -1);
    });
  }

  private getBusList(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.busList = data;
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
      const allParticipants = this.reservationData.filter(p => !p.isMain);
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
          remaining: totalCost - primary.paid,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          participants: [],
          roomType: primary.roomType
        });
      }
      if (allParticipants.length > 0) {
        allParticipants.forEach(p => {
          if (p.birthDate.toDate().getFullYear() >= 2000) {
            this.addChild();
          } else {
            this.addAdult();
          }
        });
        this.model.form.patchValue({
          participants: allParticipants.map(item => ({...item, birthDate: new Date(item.birthDate.toMillis())}))
        });
      }
    }
  }

  // private getSettings(): void {
  //   this.fireStoreService.getAll<ISettings>(Constants.RealtimeDatabase.settings).subscribe(data => {
  //     if (data && data.length > 0) {
  //       // this.model.adultReservationPrice = data[0].reservationPrice;
  //       // this.model.childReservationPriceLessThanEight = data[0].childReservationPriceLessThanEight;
  //       // this.model.childReservationPriceMoreThanEight = data[0].childReservationPriceMoreThanEight;
  //       // this.model.childBedPrice = data[0].childBedPrice;
  //       this.patchFormValue();
  //     }
  //   });
  // }

  private getTotalCost(): number {
    if (this.reservationData.length > 0) {
      const primary = this.reservationData.find(m => m.isMain);
      if (primary) {
        const roomType = this.model.form.value.roomType;
        if (roomType === RoomType.single) {
          return 800 + this.getTransportPrice(primary.transportationId);
        } else if (roomType === RoomType.double) {
          return 1050 + this.getTransportPrice(primary.transportationId);
        } else if (roomType === RoomType.triple) {
          return 950 + this.getTransportPrice(primary.transportationId);
        } else {
          return 800 + this.getTransportPrice(primary.transportationId);
        }
      }
      return 0;

      // let childrenCost = 0;
      // let adultCost = 0;
      // let primaryCost = 0;
      // const primary = this.reservationData.find(m => m.isMain);
      // if (primary) {
      //   primaryCost = this.model.adultReservationPrice + this.getTransportPrice(primary.transportationId);
      //   const children = this.reservationData.filter(c => c.isChild);
      //   const adults = this.reservationData.filter(c => !c.isChild && !c.isMain);
      //   if (primary.childrenCount > 0 && children && children.length > 0) {
      //     children.forEach(child => {
      //       const reservationPrice = this.getChildReservationPrice(child.birthDate);
      //       const bedPrice = this.getChildBedPrice(child);
      //       const transportPrice = this.getTransportPrice(child.transportationId);
      //       childrenCost += (reservationPrice + bedPrice + transportPrice);
      //     });
      //   }
      //   if (primary.adultsCount > 0 && adults && adults.length > 0) {
      //     adults.forEach(adult => {
      //       const price = this.model.adultReservationPrice;
      //       const transportPrice = this.getTransportPrice(adult.transportationId);
      //       adultCost += price + transportPrice;
      //     });
      //   }
      //   return primaryCost + adultCost + childrenCost;
      // }
      // return 0;
    }
    return 0;
  }

  // private getChildReservationPrice(birthDate?: Timestamp): number {
  //   if (birthDate) {
  //     const today = new Date();
  //     const userBirthDate = birthDate.toDate();
  //     let childYears = today.getFullYear() - userBirthDate.getFullYear();
  //     const monthDiff = today.getMonth() - userBirthDate.getMonth();
  //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < userBirthDate.getDate())) {
  //       childYears--;
  //     }
  //     if(childYears > 4 ) {
  //       return ;
  //     } else {
  //       return 0;
  //     }
  //   }
  //   return 0;
  // }

  private getTransportPrice(transportId: string): number {
    if (transportId && this.model.busList.length > 0) {
      const bus = this.model.busList.find(b => b.id === transportId);
      if (bus) {
        return +bus.price;
      }
      return 0;
    }
    return 0;
  }

  // private getChildBedPrice(child: ITicket): number {
  //   if (child) {
  //     const childYears = new Date().getFullYear() - child.birthDate.toDate().getFullYear();
  //     if (childYears <= 4) {
  //       return 0; // Already pay as the adult
  //     } else {
  //       return child.needsSeparateBed ? this.model.childBedPrice : 0;
  //     }
  //   }
  //   return 0;
  // }

}
