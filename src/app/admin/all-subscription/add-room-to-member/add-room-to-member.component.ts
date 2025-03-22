import { Component, OnInit, Inject } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IAddRoomToMemberDialogConfig, IMemberRoomViewModel, IRoom, RoomErrorsModal } from '@app/models';
import { NotifyService, FireStoreService, DialogService } from '@app/services';
import { SharedModule } from 'app/shared/shared.module';

@Component({
  templateUrl: './add-room-to-member.component.html',
  styleUrls: ['./add-room-to-member.component.scss'],
  imports: [SharedModule]
})
export class AddRoomToMemberComponent implements OnInit {
  form: FormGroup;
  rooms: Array<IRoom> = [];
  family: Array<IMemberRoomViewModel> = [];
  primary!: IMemberRoomViewModel;
  isSaveButtonDisabled = false;
  isSaveLoading = false;

  constructor(
    private dialogRef: MatDialogRef<AddRoomToMemberComponent>,
    private formBuilder: FormBuilder,
    private fireStoreService: FireStoreService,
    private notifyService: NotifyService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private config: IAddRoomToMemberDialogConfig
    ) {
      this.form = this.formBuilder.group({
        roomId: ['', Validators.required],
      });
    }

  ngOnInit(): void {
    this.setPrimary();
    this.setRooms();
    this.getRelatedMembersByPrimaryId();
  }

  save(event: Event, categoryForm: FormGroupDirective): void {
    categoryForm.onSubmit(event);
    if (this.form.valid) {
      if (this.config.data) {
        const isPrimaryChecked = this.primary && this.primary.isChecked && !this.primary.hasRoom;
        const isFamilyChecked = this.family.length > 0 && this.family.filter(m => m.isChecked && !m.hasRoom).length > 0;
        if (isPrimaryChecked || isFamilyChecked) {
          this.update();
        } else {
          this.openErrorModal(RoomErrorsModal.emptySelection);
        }
      }
    }
  }

  close(fireRefresh = false, roomId = ''): void {
    this.dialogRef.close({fireRefresh, roomId});
  }

  openRoomCancellationModal(member: IMemberRoomViewModel): void {
    this.dialogService.openRoomCancellationModal(member.name).afterClosed().subscribe((res: {confirmCancellation: boolean}) => {
      if (res && res.confirmCancellation) {
        this.fireStoreService.updateDocumentProperty(Constants.RealtimeDatabase.tickets, member.id, 'roomId', '').subscribe(() => {
          this.notifyService.showNotifier('تم إلغاء التسكين بنجاح');
          const selectedRoom = this.rooms.find(r => r.id === member.roomId);
          if (selectedRoom) {
            const remainingAvailable = selectedRoom.available + 1;
            this.fireStoreService.updateDocumentProperty(Constants.RealtimeDatabase.rooms, member.roomId, 'available', remainingAvailable).subscribe(() => {
              this.close(true, member.roomId);
            });
          }
        });
      }
    });
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
        if (selectedIds.length <= selectedRoomAvailability) {
          this.isSaveLoading = true;
          this.fireStoreService.updateDocumentsProperty(Constants.RealtimeDatabase.tickets, selectedIds, 'roomId', roomId).subscribe(() => {
            this.notifyService.showNotifier('تم التسكين بنجاح');
            const remainingAvailable = selectedRoom.available - selectedIds.length;
            this.fireStoreService.updateDocumentProperty(Constants.RealtimeDatabase.rooms, roomId, 'available', remainingAvailable).subscribe(() => {
              this.close(true, roomId);
              this.isSaveLoading = false;
            });
          });
        } else {
          this.openErrorModal(RoomErrorsModal.exceededAvailability);
        }
      }
    }
  }

  private getRelatedMembersByPrimaryId(): void {
    if (this.config.data && this.config.data.primaryId) {
      this.fireStoreService.getMembersByPrimaryId(this.config.data.primaryId, 1).subscribe(list => {
        if (list && list.length > 0) {
          const otherMembers = list.filter(m => !m.isMain);
          const primary = list.find(m => m.isMain);
          if (otherMembers && otherMembers.length > 0) {
            this.family = otherMembers.map(m => {
              const hasRoom = m.roomId != '' && m.roomId != null;
              const roomName = hasRoom ? this.getRoomName(m.roomId) : '';
              const isChecked = hasRoom;
              const age = this.getAge(m.birthDate);
              return {...m, hasRoom, isChecked, roomName, age };
            });
          }
          if (primary) {
            const hasRoom = primary.roomId != '' && primary.roomId != null;
            const isChecked = hasRoom;
            const roomName = hasRoom ? this.getRoomName(primary.roomId) : '';
            const age = this.getAge(primary.birthDate);
            this.primary = { ...primary, hasRoom, isChecked, roomName, age };
          }
        }
        this.enableDisableSaveBtn();
      });
    }
  }

  private enableDisableSaveBtn(): void {
    if (this.config.data) {
      const isClickedMemberDisabled = !!(this.config.data.roomId && this.primary.roomId != '');
      const isFamilyDisabled = this.family.length > 0 ? this.family.filter(me => me.age > 4).every(m => m.roomId != '') : true;
      this.isSaveButtonDisabled = isClickedMemberDisabled && isFamilyDisabled;
      if (this.isSaveButtonDisabled) {
        this.form.get('roomId')?.disable();
        this.form.patchValue({
          roomId: this.config.data.roomId
        });
      }
    }
  }

  private getRoomName(roomId: string): string {
    if (roomId) {
      const foundRoom = this.rooms.find(r => r.id === roomId);
      if (foundRoom) {
        return `R:${foundRoom.room}_S:(${foundRoom.sizeName})_B:${foundRoom.building}_F:${foundRoom.floor}_A:${foundRoom.available}`;
      }
      return '';
    }
    return '';
  }

  private getAge(birthDate: Timestamp): number {
    return new Date().getFullYear() - birthDate.toDate().getFullYear();
  }

  private setPrimary(): void {
    if (this.config) {
      const data = this.config.data;
      if (data && data.isMain) {
        const isPrimaryHasRoom = data.roomId != null && data.roomId != '';
        this.primary = {
          id: data.id,
          isMain: data.isMain,
          // isChild: data.isChild,
          name: data.name,
          primaryId: data.primaryId,
          roomId: data.roomId,
          hasRoom: isPrimaryHasRoom,
          isChecked: isPrimaryHasRoom,
          roomName: isPrimaryHasRoom ? this.getRoomName(data.roomId) : '',
          birthDate: data.birthDate,
          age: this.getAge(data.birthDate)
        };
      }
    }
  }

  private setRooms(): void {
    if (this.config) {
      const rooms = this.config.rooms;
      if (rooms && rooms.length > 0) {
        this.rooms = rooms;
      }
    }
  }

  private openErrorModal(error: RoomErrorsModal): void {
    this.dialogService.openRoomErrorsModal(error);
  }
}
