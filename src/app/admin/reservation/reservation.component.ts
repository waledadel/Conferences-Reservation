import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { ReservationModel } from './reservation.models';
import { Gender, SocialStatus, BookingStatus, BookingType, IAddress, IBus, ITicket } from '@app/models';
import { DialogService, FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {

  @Input() canManageReservation = false;
  @Input() reservationData: Array<ITicket> = [];
  @Input() set type (val: BookingType) {
    this.model.selectedType = val;
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
  model: ReservationModel;

  constructor(
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private dialogService: DialogService
  ) {
    this.model = new ReservationModel();
    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    this.getAddressList();
    this.getBusList();
    this.patchFormValue();
  }

  isChild(index: number): boolean {
    return this.model.participants.controls[index].get('isChild')?.value;
  }
 
  addAdult(): void {
    this.model.participants.push(this.newParticipant(false, true));
  }

  remove(index: number): void {
    const key = this.isChild(index) ? 'child' : 'individual';
    const text = this.translationService.instant(`common.${key}`);
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${text}: ${index + 1}`))
    .afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.participants.removeAt(index);
      }
    });
  }

  addChild(): void {
    this.model.participants.push(this.newParticipant(true, true));
  }

  save(): void {
    if (this.model.form.valid) {
      if (this.model.isEditMode) {
        this.update();
      } else {
        this.add();
      }
    }
  }

  private newParticipant(isChild: boolean, needBed: boolean): FormGroup {
    const textValidator = isChild ? null : Validators.required;
    const mobileValidator = isChild ? null : [Validators.required, Validators.pattern(Constants.Regex.mobileNumber)];
    return this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      transportationId: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      userNotes: [''],
      isChild: [isChild],
      needsSeparateBed: [needBed, Validators.required],
      addressId: ['', textValidator],
      mobile: ['', mobileValidator],
      socialStatus: [SocialStatus.single, textValidator],
    });
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addTicket(formValue).subscribe(() => {
      this.showForm.emit(false);
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedSuccessfully'));
      this.model.form.reset();
    });
  }

  private update(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateTicket(formValue).subscribe(() => {
      this.closeModal.emit(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedUpdatedSuccessfully'));
      this.model.form.reset();
    });
  }

  private getAddressList(): void {
    this.fireStoreService.getAll<IAddress>(Constants.RealtimeDatabase.address).subscribe(data => {
      this.model.addressList = data;
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
      remaining: [0, [Validators.required, Validators.min(0)]],
      bookingStatus: [BookingStatus.new],
      bookingType: [this.model.selectedType, Validators.required],
      roomId: [''],
      participants: this.formBuilder.array([]),
    });
  }

  private patchFormValue(): void {
    if (this.reservationData && this.reservationData.length > 0) {
      const primary = this.reservationData.find(m => m.isMain);
      const allParticipants = this.reservationData.filter(p => !p.isMain);
      if (primary && primary != null) {
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
          total: primary.total,
          paid: primary.paid,
          remaining: primary.remaining,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          participants: []
        });
      }
      if (allParticipants.length > 0) {
        allParticipants.forEach(p => {
          if (p.isChild) {
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

}
