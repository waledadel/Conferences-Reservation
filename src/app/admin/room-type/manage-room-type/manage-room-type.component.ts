import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IRoomType } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
    selector: 'app-manage-room-type',
    templateUrl: './manage-room-type.component.html',
    standalone: false
})
export class ManageRoomTypeComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManageRoomTypeComponent>,
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: IRoomType
    ) {
      this.form = this.formBuilder.group({
        name: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(0)]]
      });
    }

  ngOnInit(): void {
    this.patchForm();
  }

  save(event: Event, categoryForm: FormGroupDirective): void {
    categoryForm.onSubmit(event);
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
        name: this.data.name,
        price: this.data.price
      });
    }
  }

  private add(): void {
    this.fireStoreService.addDoc<IRoomType>(Constants.RealtimeDatabase.roomType, this.getFormValue()).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
    });
  }

  private update(): void {
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.roomType}/${this.data.id}`, this.getFormValue()).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.updatedSuccessfully'));
    });
  }

  private getFormValue(): Omit<IRoomType, 'id'> {
    return {
      name: this.form.value.name,
      price: +this.form.value.price
    };
  }
}
