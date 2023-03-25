import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ITicket } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';

@Component({
  templateUrl: './primary.component.html'
})
export class PrimaryComponent implements OnInit {

  total = 0;
  displayedColumns: string[] = ['name', 'adultsCount', 'childrenCount', 'roomId',
  'bookingType', 'bookingDate', 'totalCost', 'paid', 'remaining', 'userNotes', 'bookingStatus', 'actions'];
  dataSource: MatTableDataSource<Partial<ITicket>> = new MatTableDataSource<Partial<ITicket>>([]);
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getPrimaryTickets();
  }

  update(item: Partial<ITicket>): void {
    this.dialogService.openAddEditDialog(ManageReservationComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        // TODO: to update list
        this.getPrimaryTickets(2);
      }
    });
  }

  delete(item: Partial<ITicket>): void {
    if (item.name) {
      this.dialogService.openConfirmDeleteDialog(item.name).afterClosed().subscribe((res: {confirmDelete: boolean}) => {
        if (res && res.confirmDelete && item.id) {
          this.fireStoreService.getPrimaryWithRelatedParticipants(item.id).subscribe(list => {
            const ids = list.map(item => item.id);
            if (ids && ids.length > 0) {
              this.fireStoreService.deleteReservation(ids).subscribe(() => {
                this.notifyService.showNotifier(this.translationService.instant('notifications.removedSuccessfully'));
                this.getPrimaryTickets();
              });
            }
          });
        }
      });
    }
  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      this.dataSource.data = res;
      this.total = res.length;
    });
  }
}
