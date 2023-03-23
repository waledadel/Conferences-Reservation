import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { TicketModel } from './ticket.models';
import { Gender, SocialStatus, TicketStatus, TicketType, IAddress, IBus } from '@app/models';
import { DialogService, FireStoreService, NotifyService, StorageService, TranslationService } from '@app/services';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {

  @Input() type: TicketType = TicketType.individual;
  model: TicketModel;

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
    this.getAddressList();
    this.getBusList();
  }

  isChild(index: number): boolean {
    return this.model.participants.controls[index].get('isChild')?.value;
  }
 
  addAdult(): void {
    this.model.participants.push(this.newParticipant(false, true));
  }

  removeAdult(index: number): void {
    const individualNo = this.translationService.instant('common.individualNo');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${individualNo}: ${index}`)).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.participants.removeAt(index);
      }
    });
  }

  addChild(): void {
    this.model.participants.push(this.newParticipant(true, true));
  }

  removeChild(index: number): void {
    const individualNo = this.translationService.instant('common.childNo');
    this.dialogService.openConfirmDeleteDialog(this.translationService.instant(`${individualNo}: ${index+1}`)).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
      if (res && res.confirmDelete) {
        this.model.participants.removeAt(index);
      }
    });
  }

  save(form: FormGroupDirective): void {
    if (this.model.form.valid) {
      this.add();
      form.reset();
    }
  }

  private newParticipant(isChild: boolean, needBed: boolean): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(Constants.Regex.arabicLetters)]],
      transportationId: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: [Gender.male, Validators.required],
      userNotes: [''],
      isChild: [isChild],
      needsSeparateBed: [needBed, Validators.required],
      addressId: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(Constants.Regex.mobileNumber)]],
      socialStatus: [SocialStatus.single, Validators.required],
    });
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addTicket(formValue).then(() => {
      this.notifyService.showNotifier(this.translationService.instant('notifications.bookedSuccessfully'));
    });
    // this.fireStoreService.addDoc<ITicket>(Constants.RealtimeDatabase.tickets, formValue).subscribe(() => {
    //   this.notifyService.showNotifier(this.translationService.instant('notifications.bookedSuccessfully'));
    // });
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
      paid: [0],
      remaining: [0],
      ticketStatus: [TicketStatus.new],
      ticketType: [this.type, Validators.required],
      roomId: [''],
      participants: this.formBuilder.array([]),
    });
  }
}
