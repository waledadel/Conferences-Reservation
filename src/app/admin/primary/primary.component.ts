import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { IPrimaryChildrenViewModel, IPrimaryListViewModel, ISettings, ITicket } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';
import { Constants } from '@app/constants';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  templateUrl: './primary.component.html'
})
export class PrimaryComponent implements OnInit {

  total = 0;
  adultReservationPrice = 0;
  childReservationPriceLessThanEight = 0;
  childReservationPriceMoreThanEight = 0;
  childBedPrice = 0;
  displayedColumns: string[] = ['name', 'adultsCount', 'childrenCount', 'roomId',
  'bookingType', 'bookingDate', 'totalCost', 'paid', 'remaining', 'userNotes', 'bookingStatus', 'actions'];
  dataSource: MatTableDataSource<Partial<IPrimaryListViewModel>> = new MatTableDataSource<Partial<IPrimaryListViewModel>>([]);
  children: Array<IPrimaryChildrenViewModel> = [];
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getSettings();
  }

  update(item: Partial<ITicket>): void {
    this.dialogService.openAddEditDialog(ManageReservationComponent, 'lg', true, item).afterClosed()
    .subscribe((res: {fireRefresh: boolean}) => {
      if (res.fireRefresh) {
        this.updateTableRow(item);
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
                this.removeRow(item);
              });
            }
          });
        }
      });
    }
  }

  private getChildSubscription(takeCount = 1): void {
    this.fireStoreService.getChildSubscription(takeCount).subscribe(res => {
      this.children = res;
      this.getPrimaryTickets();
    });
  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      this.dataSource.data = res.map(item => ({...item, totalCost: this.getTotalCost(item)}));
      this.total = res.length;
    });
  }

  private getSettings(): void {
    this.fireStoreService.getAll<ISettings>(Constants.RealtimeDatabase.settings).subscribe(data => {
      if (data && data.length > 0) {
        this.adultReservationPrice = data[0].reservationPrice;
        this.childReservationPriceLessThanEight = data[0].childReservationPriceLessThanEight;
        this.childReservationPriceMoreThanEight = data[0].childReservationPriceMoreThanEight;
        this.childBedPrice = data[0].childBedPrice;
        this.getChildSubscription();
      }
    });
  }

  private updateTableRow(item: Partial<ITicket>): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.tickets}/${item.id}`).subscribe((res: Partial<ITicket>) => {
      console.log('res', res);
      if (res) {
        const index = this.dataSource.data.findIndex(t => t.id === item.id);
        if (index > -1) {
          this.dataSource.data[index] = {...res, totalCost: this.getTotalCost(res)};
          this.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  private removeRow(item: Partial<ITicket>): void {
    const index = this.dataSource.data.findIndex(t => t.id === item.id);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      this.total -= 1;
    }
  }

  private getTotalCost(ticket: Partial<ITicket>): number {
    if (ticket) {
      if (this.children.length > 0) {
        let childrenCost = 0;
        const children = this.children.filter(c => c.primaryId === ticket.id);
        if (children && children.length > 0) {
          children.forEach(child => {
            childrenCost += this.getChildReservationPrice(child.birthDate) + (child.needsSeparateBed ? this.childBedPrice : 0)
          });
        }
        return childrenCost + (ticket.adultsCount! + 1) * this.adultReservationPrice;
      }
      return (ticket.adultsCount! + 1) * this.adultReservationPrice;
    }
    return 0;
  }

  private getChildReservationPrice(birthDate?: Timestamp): number {
    if (birthDate) {
      const childYears = new Date().getFullYear() - birthDate.toDate().getFullYear();
      if (childYears >= 8 && childYears < 12) {
        return this.childReservationPriceMoreThanEight;
      } else if(childYears >= 4 && childYears < 8) {
        return this.childReservationPriceLessThanEight;
      } else {
        return 0;
      }
    }
    return 0;
  }
}
