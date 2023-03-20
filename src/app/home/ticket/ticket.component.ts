import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { TicketModel } from './ticket.models';
import { Gender, SocialStatus, TicketStatus, TicketType, ITicket, IAddress, IBus } from '@app/models';
import { DialogService, FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';

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
    private translationService: TranslationService,
    private dialogService: DialogService
  ) {
    this.model = new TicketModel();
    this.model.form = this.initFormModels();
  }

  ngOnInit(): void {
    this.model.isArabic = this.storageService.getItem(Constants.Languages.languageKey) === Constants.Languages.ar;
    this.addAdult();
    if (this.type === TicketType.group) {
      this.addChild();
    }
    this.getAddressList();
    this.getBusList();
  }
 
  addAdult(): void {
    this.model.adults.push(this.newAdult());
  }

  removeAdult(index: number): void {
    const individualNo = this.translationService.instant('common.individualNo');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${individualNo}: ${index+1}`)).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.adults.removeAt(index);
      }
    });
  }

  addChild(): void {
    this.model.children.push(this.newChild());
  }

  removeChild(index: number): void {
    const individualNo = this.translationService.instant('common.childNo');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${individualNo}: ${index+1}`)).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.children.removeAt(index);
      }
    });
  }

  save(form: FormGroupDirective): void {
    if (this.model.form.valid) {
      this.add();
      form.reset();
    }
  }

  private newAdult(): FormGroup {
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
    });
  }

  private newChild(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      transportation: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      needBed: [true, Validators.required]
    });
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addDoc<ITicket>(Constants.RealtimeDatabase.tickets, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedSuccessfully'));
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
