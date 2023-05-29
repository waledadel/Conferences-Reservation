import { Component, HostListener, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { AdvancedSearchModel, IAdvancedFilterForm } from './advanced-search.models';
import { BookingStatus, Gender, IBus } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {

  model: AdvancedSearchModel;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(
    private fireStoreService: FireStoreService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AdvancedSearchComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) private perviousFilter: IAdvancedFilterForm
  ) {
    this.model = new AdvancedSearchModel();
  }
  
  ngOnInit(): void {
    this.model.form = this.initFormModels();
    this.detectMobileView();
    this.getBuses();
    this.patchFromValue();
    this.model.showPrimaryOptions = this.router.url.includes('primary');
  }

  close(): void {
    this.dialogRef.close();
  }

  reset(): void {
    this.model.form.patchValue({
      name: '',
      mobile: '',
      adultsCount: 0,
      childrenCount: 0,
      paid: 0,
      total: 0,
      remaining: 0,
      transportationId: 'all',
      gender: Gender.all,
      bookingStatus: BookingStatus.all,
      birthDateMonth: 0,
      fromAge: 0,
      toAge: 0
    });
    this.filter();
  }

  filter(): void {
    this.dialogRef.close(this.model.form.value)
  }

  private initFormModels() {
    return this.formBuilder.group({
      name: [''],
      mobile: [''],
      adultsCount: [0],
      childrenCount: [0],
      paid: [0],
      total: [0],
      remaining: [0],
      transportationId: ['all'],
      gender: [Gender.all],
      bookingStatus: [BookingStatus.all],
      birthDateMonth: [0],
      fromAge: [0],
      toAge: [0],
    });
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.model.buses = data;
    });
  }

  private detectMobileView(): void {
    this.model.isMobileView = this.isMobile;
  }

  private patchFromValue(): void {
    if (this.perviousFilter && this.perviousFilter != null) {
      this.model.form.patchValue({
        name: this.perviousFilter.name,
        mobile: this.perviousFilter.mobile,
        adultsCount: this.perviousFilter.adultsCount,
        childrenCount: this.perviousFilter.childrenCount,
        paid: this.perviousFilter.paid,
        total: this.perviousFilter.total,
        remaining: this.perviousFilter.remaining,
        transportationId: this.perviousFilter.transportationId,
        gender: this.perviousFilter.gender,
        bookingStatus: this.perviousFilter.bookingStatus,
        birthDateMonth: this.perviousFilter.birthDateMonth,
        fromAge: this.perviousFilter.fromAge,
        toAge: this.perviousFilter.toAge,
      });
    }
  }
}
