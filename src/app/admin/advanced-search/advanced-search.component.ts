import { Component, HostListener, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Constants } from '@app/constants';
import { AdvancedSearchModel, IAdvancedFilterForm } from './advanced-search.models';
import { BookingStatus, Gender, IBus } from '@app/models';
import { FireStoreService } from '@app/services';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {

  @Output() filterChanged = new EventEmitter<IAdvancedFilterForm>();
  @Input() hideMainProp = false;
  model: AdvancedSearchModel;
  get isMobile(): boolean {
    return window.innerWidth < Constants.Grid.large;
  }

  @HostListener('window:resize', ['$event']) onWindowResize(): void {
    this.detectMobileView();
  }

  constructor(
    private fireStoreService: FireStoreService,
    private formBuilder: FormBuilder
  ) {
    this.model = new AdvancedSearchModel();
  }
  
  ngOnInit(): void {
    this.model.form = this.initFormModels();
    this.detectMobileView();
    this.getBuses();
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
    this.filterChanged.emit(this.model.form.value);
  }

  filter(): void {
    this.filterChanged.emit(this.model.form.value);
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
      bookingStatus: BookingStatus.all,
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
}
