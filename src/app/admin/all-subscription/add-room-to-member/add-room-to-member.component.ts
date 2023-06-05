import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IAllSubscriptionDataSourceVm, IRoom } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
  templateUrl: './add-room-to-member.component.html'
})
export class AddRoomToMemberComponent implements OnInit {
  form: FormGroup;
  rooms: Array<IRoom> = [];

  constructor(
    public dialogRef: MatDialogRef<AddRoomToMemberComponent>,
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) private data: IAllSubscriptionDataSourceVm
    ) {
      this.form = this.formBuilder.group({
        roomId: ['', Validators.required],
      });
    }

  ngOnInit(): void {
    this.getRooms();
    this.patchForm();
  }

  save(event: Event, categoryForm: FormGroupDirective): void {
    categoryForm.onSubmit(event);
    if (this.form.valid) {
      if (this.data) {
        this.update();
      }
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  private patchForm(): void {
    if (this.data) {
      this.form.patchValue({
        roomId: this.data.roomId
      });
    }
  }

  private update(): void {
    const roomId = this.form.value.roomId;
    this.fireStoreService.updateDocumentProperty(Constants.RealtimeDatabase.tickets, this.data.id, 'roomId', roomId).subscribe(() => {
      this.close(true);
      this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
    });
  }

  private getRooms(): void {
    this.fireStoreService.getAll<IRoom>(Constants.RealtimeDatabase.rooms).subscribe(data => {
      if (data && data.length > 0) {
        this.rooms = data.map(r => ({
          ...r,
          displayedName: `Room:${r.room}-(${r.sizeName})-Building:${r.building}-Floor:${r.floor}-Available:${r.available}`,
          size: this.getRoomCountSize(r.sizeName),
        }));
      }
    });
  }

  private getRoomCountSize(sizeName: string): number {
    let roomSize = 0;
    if (sizeName.toString().includes('+')) {
      const list = sizeName.split('+');
      roomSize = list.reduce((accumulator, currentValue) => accumulator + (+currentValue), 0);
    } else {
      roomSize = (+sizeName);
    }
    return roomSize;
  }
}
