import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { IBus, IRelatedMemberViewModel, IPrimaryDataSourceVm, ISettings, ITicket, ICostDetailsDataSourceVm } from '@app/models';
import { DialogService, FireStoreService, NotifyService, TranslationService } from '@app/services';
import { ManageReservationComponent } from '../reservation/manage-reservation/manage-reservation.component';
import { Constants } from '@app/constants';
import { Timestamp } from '@angular/fire/firestore';
import { CostDetailsComponent } from './cost-details/cost-details.component';

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
  dataSource: MatTableDataSource<IPrimaryDataSourceVm> = new MatTableDataSource<IPrimaryDataSourceVm>([]);
  notPrimaryMembers: Array<IRelatedMemberViewModel> = [];
  buses: Array<IBus> = [];
  
  constructor(
    private fireStoreService: FireStoreService,
    private dialogService: DialogService,
    private notifyService: NotifyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.getBuses();
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

  viewCostDetails(item: IPrimaryDataSourceVm): void {
    const list: Array<ICostDetailsDataSourceVm> = [];
    // Primary
    list.push({
      isChild: false,
      isMain: true,
      name: item.name,
      bedPrice: 0,
      needBed: true,
      privateTransport: this.isPrivateTransport(item.transportationId),
      reservationPrice: this.adultReservationPrice,
      transportPrice: this.getTransportPrice(item.transportationId)
    });
    // other members
    const allRelatedMembers = this.notPrimaryMembers.filter(m => m.primaryId === item.primaryId);
    if (allRelatedMembers.length > 0) {
      const adults = allRelatedMembers.filter(m => !m.isChild);
      const children = allRelatedMembers.filter(m => m.isChild);
      if (children && children.length > 0) {
        children.forEach(item => {
          list.push({
            isChild: true,
            isMain: false,
            name: item.name,
            bedPrice: this.getChildBedPrice(item),
            needBed: item.needsSeparateBed,
            privateTransport: this.isPrivateTransport(item.transportationId),
            reservationPrice: this.getChildReservationPrice(item.birthDate),
            transportPrice: this.getTransportPrice(item.transportationId)
          });
        });
      }
      if (adults && adults.length > 0) {
        adults.forEach(item => {
          list.push({
            isChild: false,
            isMain: false,
            name: item.name,
            bedPrice: 0,
            needBed: item.needsSeparateBed,
            privateTransport: this.isPrivateTransport(item.transportationId),
            reservationPrice: this.adultReservationPrice,
            transportPrice: this.getTransportPrice(item.transportationId)
          });
        });
      }
    }
    this.dialogService.openAddEditDialog(CostDetailsComponent, 'xlg', true, list);
  }

  private isPrivateTransport(transportId: string): boolean {
    if (transportId && this.buses.length > 0) {
      const bus = this.buses.find(b => b.id === transportId);
      if (bus) {
        return bus.price > 0 ? false : true;
      }
      return false;
    }
    return false;
  }

  private getNotPrimarySubscription(takeCount = 1): void {
    this.fireStoreService.getNotPrimarySubscription(takeCount).subscribe(res => {
      this.notPrimaryMembers = res;
      this.getPrimaryTickets();
    });
  }

  private getPrimaryTickets(takeCount = 1): void {
    this.fireStoreService.getPrimarySubscription(takeCount).subscribe(res => {
      this.dataSource.data = res.map(item => ({...item, totalCost: this.getTotalCost(item, this.notPrimaryMembers)}));
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
        this.getNotPrimarySubscription();
      }
    });
  }

  private updateTableRow(item: Partial<ITicket>): void {
    this.fireStoreService.getById(`${Constants.RealtimeDatabase.tickets}/${item.id}`).subscribe((res: IPrimaryDataSourceVm) => {
      if (res) {
        const index = this.dataSource.data.findIndex(t => t.id === item.id);
        if (index > -1 && res.primaryId) {
          this.fireStoreService.getRelatedMembersByPrimaryId(res.primaryId, 1).subscribe(list => {
            if (list && list.length > 0) {
              this.dataSource.data[index] = {...res, totalCost: this.getTotalCost(res, list)};
            } else {
              this.dataSource.data[index] = {...res, totalCost: this.getTotalCost(res, this.notPrimaryMembers)};
            }
            this.dataSource._updateChangeSubscription();
          });
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

  private getTotalCost(ticket: IPrimaryDataSourceVm, list: Array<IRelatedMemberViewModel>): number {
    if (ticket) {
      let childrenCost = 0;
      let adultCost = 0;
      let primaryCost = 0;
      primaryCost = this.adultReservationPrice + this.getTransportPrice(ticket.transportationId);
      if (list.length > 0) {
        if (ticket.childrenCount > 0) {
          const children = list.filter(c => c.primaryId === ticket.id && c.isChild);
          if (children && children.length > 0) {
            children.forEach(child => {
              const reservationPrice = this.getChildReservationPrice(child.birthDate);
              const bedPrice = this.getChildBedPrice(child);
              const transportPrice = this.getTransportPrice(child.transportationId);
              childrenCost += (reservationPrice + bedPrice + transportPrice);
            });
          }
        }
        if (ticket.adultsCount > 0) {
          const adults = list.filter(c => c.primaryId === ticket.id && !c.isChild);
          if (adults && adults.length > 0) {
            adults.forEach(adult => {
              const price = this.adultReservationPrice;
              const transportPrice = this.getTransportPrice(adult.transportationId);
              adultCost += price + transportPrice;
            });
          }
        }
      }
      return primaryCost + adultCost + childrenCost;
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

  private getChildBedPrice(child: IRelatedMemberViewModel ): number {
    if (child) {
      const childYears = new Date().getFullYear() - child.birthDate.toDate().getFullYear();
      if (childYears >= 8 && childYears < 12) {
        return 0; // Already pay as the adult
      } else {
        return child.needsSeparateBed ? this.childBedPrice : 0;
      }
    }
    return 0;
  }

  private getBuses(): void {
    this.fireStoreService.getAll<IBus>(Constants.RealtimeDatabase.buses).subscribe(data => {
      this.buses = data;
    });
  }

  private getTransportPrice(transportId: string): number {
    if (transportId && this.buses.length > 0) {
      const bus = this.buses.find(b => b.id === transportId);
      if (bus) {
        return +bus.price;
      }
      return 0;
    }
    return 0;
  }
}
