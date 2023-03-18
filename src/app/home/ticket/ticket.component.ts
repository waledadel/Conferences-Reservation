import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { TicketModel } from './ticket.models';
import { Gender, SocialStatus, TicketStatus, TicketType, ITicket } from '@app/models';
import { FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {

  @Input() type: TicketType = TicketType.individual;
  model: TicketModel;

  get isMajor(): boolean {
    return this.type === TicketType.group;
  }

  constructor(
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private storageService: StorageService,
    private translationService: TranslationService
    ) {
      this.model = new TicketModel();
      this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    console.log('isArabic', this.model.isArabic);
    if (this.type === TicketType.individual) {
      this.addAdult();
    console.log('form', this.model.form.value);

    }
    this.getAddressList();
    this.getBusList();
    // this.patchForm();
  }

  newAdult(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      mobile: ['', [Validators.required, Validators.pattern(Constants.Regex.mobileNumber)]],
      transportation: ['', Validators.required],
      address: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      status: [SocialStatus.single, Validators.required],
      userNotes: [''],
      isMajor: [this.isMajor],
    })
  }
 
  addAdult(): void {
    this.model.adults.push(this.newAdult());
  }

  removeAdult(index: number): void {
    this.model.adults.removeAt(index);
  }

  onBirthDateChange(event: MatDatepickerInputEvent<Date>, index: number): void {
    console.log('date', event.value, index);
    if (event.value != null) {
      // this.model.adults.at(index).patchValue({
      //   birthDate: Timestamp.fromDate(event.value)
      // });
      // console.log('form value', this.model.form.value);
    }
  }

  save(): void {
    this.add();
    console.log('form', this.model.form.value);
    if (this.model.form.valid) {
      this.add();
      this.model.form.reset();
      // if (this.data) {
      //   this.update();
      // } else {
      //   this.add();
      // }
    }
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addDoc<ITicket>(Constants.RealtimeDatabase.tickets, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedSuccessfully'));
    });
  }

  // private update(): void {
  //   this.baseService.update<ITrain>(Constants.RealtimeDatabase.trains, this.data.id, this.form.value).then(() => {
  //     this.notifyService.showNotifier('Train Updated Successfully');
  //   });
  // }

  private getAddressList(): void {
    this.fireStoreService.getAll(Constants.RealtimeDatabase.address).subscribe(data => {
      console.log('data', data);
      // this.model.addressList = data;
    });
  }

  private getBusList(): void {
    this.fireStoreService.getAll(Constants.RealtimeDatabase.buses).subscribe(data => {
      // this.model.busList = data;
    });
  }

  private initFormModels() {
    return this.formBuilder.group({
      adminNotes: [''],
      total: [0],
      paid: [0],
      remaining: [0],
      status: [TicketStatus.new],
      type: [this.type, Validators.required],
      children: this.formBuilder.array([]),
      adults: this.formBuilder.array([]),
      bookingDate: [Timestamp.fromDate(new Date())],
    });
  }
}
