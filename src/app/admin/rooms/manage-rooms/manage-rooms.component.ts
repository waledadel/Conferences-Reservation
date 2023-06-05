import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IRoom } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
  templateUrl: './manage-rooms.component.html'
})
export class ManageRoomsComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManageRoomsComponent>,
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: IRoom
    ) {
      this.form = this.formBuilder.group({
        room: [0, Validators.required],
        building: [0, Validators.required],
        floor: [0, Validators.required],
        sizeName: ['', Validators.required]
      });
    }

  ngOnInit(): void {
    this.patchForm();
  }

  save(event: Event, roomForm: FormGroupDirective): void {
    roomForm.onSubmit(event);
    if (this.form.valid) {
      if (this.data) {
        this.update();
      } else {
        // this.add();
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
        building: this.data.building,
        floor: this.data.floor,
        room: this.data.room,
        sizeName: this.data.sizeName
      });
    }
  }

  // private add(): void {
  //   this.fireStoreService.addDoc<IBus>(Constants.RealtimeDatabase.buses, this.form.value).subscribe(() => {
  //     this.close(true);
  //     this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
  //   });
  // }

  private update(): void {
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.rooms}/${this.data.id}`, this.form.value).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.updatedSuccessfully'));
    });
  }
}
