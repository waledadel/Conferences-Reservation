import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IAddress, IBus } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
  templateUrl: './manage-address.component.html'
})
export class ManageAddressComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManageAddressComponent>,
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: IAddress
    ) {
      this.form = this.formBuilder.group({
        name: ['', Validators.required]
      });
    }

  ngOnInit(): void {
    this.patchForm();
  }

  save(categoryForm: FormGroupDirective): void {
    if (this.form.valid) {
      if (this.data) {
        this.update();
      } else {
        this.add();
      }
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  private patchForm(): void {
    if (this.data) {
      this.form.patchValue({
        id: this.data.id,
        name: this.data.name
      });
    }
  }

  private add(): void {
    this.fireStoreService.addDoc<IBus>(Constants.RealtimeDatabase.address, this.form.value).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
    });
  }

  private update(): void {
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.address}/${this.data.id}`, this.form.value).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.updatedSuccessfully'));
    });
  }
}
