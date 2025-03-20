import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IRoom } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
    templateUrl: './manage-rooms.component.html',
    standalone: false
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
        room: [null, Validators.required],
        building: [null, Validators.required],
        floor: [null, Validators.required],
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
        building: this.data.building,
        floor: this.data.floor,
        room: this.data.room,
        sizeName: this.data.sizeName
      });
    }
  }

  private add(): void {
    const formValue: IRoom = this.form.value;
    let roomSize = 0;
    if (formValue.sizeName.toString().includes('+')) {
      const list = formValue.sizeName.split('+');
      roomSize = list.reduce((accumulator, currentValue) => accumulator + (+currentValue), 0);
    } else {
      roomSize = (+formValue.sizeName);
    }
    const data: IRoom = {
      ...formValue,
      available: roomSize,
      notUsed: 0,
      current: 0,
      building: +formValue.building,
      floor: +formValue.floor,
      room: +formValue.room,
    };
    this.fireStoreService.addDoc<IRoom>(Constants.RealtimeDatabase.rooms, data).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
    });
  }

  private update(): void {
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.rooms}/${this.data.id}`, this.form.value).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.updatedSuccessfully'));
    });
  }
}
