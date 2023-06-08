import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IAllSubscriptionDataSourceVm, IMemberRoomViewModel, IRoom } from '@app/models';
import { NotifyService, TranslationService, FireStoreService } from '@app/services';

@Component({
  templateUrl: './add-room-to-member.component.html'
})
export class AddRoomToMemberComponent implements OnInit {
  form: FormGroup;
  rooms: Array<IRoom> = [];
  family: Array<IMemberRoomViewModel> = [];
  primary!: IMemberRoomViewModel;
  showEmptySelectErrorMessage = false;
  isExceededRoomAvailability = false;

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
    if (this.data && this.data.isMain) {
      this.primary = {
        id: this.data.id,
        isMain: this.data.isMain,
        isChild: this.data.isChild,
        name: this.data.name,
        primaryId: this.data.primaryId,
        roomId: this.data.roomId,
        hasRoom: (this.data.roomId != null && this.data.roomId != '') ?? false,
        isChecked: (this.data.roomId != null && this.data.roomId != '') ?? false
      };
    }
    this.getRelatedMembersByPrimaryId();
  }

  save(event: Event, categoryForm: FormGroupDirective): void {
    categoryForm.onSubmit(event);
    if (this.form.valid) {
      if (this.data) {
        const isPrimaryChecked = this.primary && this.primary.isChecked && !this.primary.hasRoom;
        if (isPrimaryChecked || this.family.length > 0) {
          this.showEmptySelectErrorMessage = false;
          this.update();
        } else {
          this.showEmptySelectErrorMessage = true;
        }
      }
    }
  }

  close(fireRefresh = false): void {
    this.dialogRef.close({fireRefresh});
  }

  cancel(memberId: string): void {

  }

  private patchForm(): void {
    if (this.data) {
      this.form.patchValue({
        roomId: this.data.roomId
      });
    }
  }

  private update(): void {
    const selectedIds: Array<string> = [];
    const roomId = this.form.value.roomId;
    const isPrimaryChecked = this.primary && this.primary.isChecked && !this.primary.hasRoom;
    if (isPrimaryChecked) {
      selectedIds.push(this.primary.id);
    }
    if (this.family.length > 0) {
      const checkedMembers = this.family.filter(m => !m.hasRoom && m.isChecked);
      if (checkedMembers && checkedMembers.length > 0) {
        selectedIds.push(...checkedMembers.map(m => m.id)); 
      }
    }
    if (selectedIds.length > 0) {
      const selectedRoom = this.rooms.find(r => r.id === roomId);
      if (selectedRoom) {
        const selectedRoomAvailability = selectedRoom.available;
        if (selectedIds.length > selectedRoomAvailability) {
          this.isExceededRoomAvailability = true;
        } else {
          this.fireStoreService.updateDocumentsProperty(Constants.RealtimeDatabase.tickets, selectedIds, 'roomId', roomId).subscribe(() => {
            this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
            const remainingAvailable = selectedRoom.available - selectedIds.length;
            this.fireStoreService.updateDocumentProperty(Constants.RealtimeDatabase.rooms, roomId, 'available', remainingAvailable).subscribe(() => {
              this.close(true);
            });
          });
        }
      }
    }
  }

  private getRooms(): void {
    this.fireStoreService.getAll<IRoom>(Constants.RealtimeDatabase.rooms).subscribe(data => {
      if (data && data.length > 0) {
        this.rooms = data.sort((a,b) => a.room - b.room).map(r => ({
          ...r,
          displayedName: `R:${r.room}_S:(${r.sizeName})_B:${r.building}_F:${r.floor}_A:${r.available}`,
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

  private getRelatedMembersByPrimaryId(): void {
    if (this.data && this.data.primaryId) {
      this.fireStoreService.getMembersByPrimaryId(this.data.primaryId, 1).subscribe(list => {
        if (list && list.length > 0) {
          const otherMembers = list.filter(m => !m.isMain);
          const primary = list.find(m => m.isMain);
          if (otherMembers && otherMembers.length > 0) {
            this.family = otherMembers.map(m => ({
              ...m,
              hasRoom: (m.roomId != '' && m.roomId != null) ?? false,
              isChecked: (m.roomId != '' && m.roomId != null) ?? false
            }));
          }
          if (primary) {
            this.primary = {
              ...primary,
              hasRoom: (primary.roomId != '' && primary.roomId != null) ?? false,
              isChecked: (primary.roomId != '' && primary.roomId != null) ?? false
            };
          }
        }
      });
    }
  }
}
