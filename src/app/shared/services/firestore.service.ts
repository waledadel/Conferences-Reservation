import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, first, from, map, take } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, query, SnapshotOptions, where } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, docData } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { IRelatedMemberViewModel, ITicket, ITicketForm, IUser, IRoomDataSource, IMemberRoomDataSource, BookingStatus } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class FireStoreService {

  private readonly firestore = inject(Firestore);
  private readonly angularFirestore = inject(AngularFirestore);

  createId(): string {
    return this.angularFirestore.createId();
  }

  getAll<T>(endPoint: string): Observable<T[]> {
    const coll = collection(this.firestore, endPoint);
    // orderBy('bookingDate', 'desc'), limit(10)
    const documentQuery = query(coll);
    const options = { idField: 'id' } as SnapshotOptions;
    return collectionData(documentQuery, options).pipe(take(1)) as Observable<T[]>;
  }

  getById(path: string): Observable<any> {
    const docRef = doc(this.firestore, path);
    return docData(docRef, { idField: 'id' }) as Observable<any>;
  }

  getUserByEmail(email: string): Observable<IUser> {
    return this.angularFirestore
      .collection<IUser>(Constants.RealtimeDatabase.users, ref =>
        ref.where('email', '==', email)
      )
      .valueChanges({ idField: 'id' }).pipe(
        map(users => users[0]) // Return the first user in the array
      );
  }

  addDoc<T>(collectionName: string, data: PartialWithFieldValue<any>): Observable<DocumentReference<T>> {
    const collectionRef = collection(this.firestore, collectionName);
    return from(addDoc(collectionRef, data));
  }

  updateTicket(item: ITicketForm, removedIds: Array<string>): Observable<unknown> {
    const currentLoggedInUser = localStorage.getItem('userId');
    const isParticipantsExists = item.participants && item.participants.length > 0;
    const isChildrenExists = item.children && item.children.length > 0;
    const childrenCounts = item.children.length;
    const adultsCounts = item.participants.length;
    const batch = this.angularFirestore.firestore.batch();
    const primaryRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${item.id}`).ref;
    const primary: ITicket = {
      id: item.id,
      name: item.name,
      addressId: item.addressId,
      birthDate: item.birthDate,
      gender: item.gender,
      socialStatus: item.socialStatus,
      mobile: item.mobile,
      transportationId: item.transportationId,
      userNotes: item.userNotes,
      bookingDate: item.bookingDate,
      adminNotes: item.adminNotes,
      paid: item.paid,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      isMain: true,
      primaryId: item.id,
      lastUpdateDate: Timestamp.fromDate(new Date()),
      lastUpdateUserId: currentLoggedInUser ?? '',
      roomType: item.roomType,
      deletedBy: '',
      mainMemberName: ''
    };
    batch.set(primaryRef, primary);
    if (isParticipantsExists) {
      item.participants.filter(t => t.id != '' && t.id != null).forEach(p => {
        const participant: Partial<ITicket> = { ...p, isMain: false };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.update(participantRef, { ...participant });
      });
      const newMembersAddedByAdmin = item.participants.filter(t => t.id == '');
      if (newMembersAddedByAdmin && newMembersAddedByAdmin.length > 0) {
        item.participants.filter(t => t.id == '').forEach(p => {
          const participant: Partial<ITicket> = {
            ...p,
            id: this.createId(),
            isMain: false,
            primaryId: primary.id,
          };
          const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
          batch.set(participantRef, { ...participant });
        });
      }
    }
    if (isChildrenExists) {
      item.children.filter(t => t.id != '' && t.id != null).forEach(p => {
        const child: Partial<ITicket> = {
          ...p,
          isMain: false
        };
        const childRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${child.id}`).ref;
        batch.update(childRef, { ...child });
      });
      const newChildAddedByAdmin = item.children.filter(t => t.id == '');
      if (newChildAddedByAdmin && newChildAddedByAdmin.length > 0) {
        item.children.filter(t => t.id == '').forEach(p => {
          const child: Partial<ITicket> = {
            ...p,
            id: this.createId(),
            isMain: false,
            primaryId: primary.id,
          };
          const childRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${child.id}`).ref;
          batch.set(childRef, { ...child });
        });
      }
    }
    if (removedIds && removedIds.length > 0) {
      removedIds.filter(id => id != '' && id != null).forEach(item => {
        if (item && item != '') {
          const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${item}`).ref;
          batch.delete(participantRef);
        }
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  addTicket(item: ITicketForm): Observable<unknown> {
    const isParticipantsExists = item.participants && item.participants.length > 0;
    const isChildrenExists = item.children && item.children.length > 0;
    const childrenCounts = item.children.length;
    const adultsCounts = item.participants.length;
    const primaryId = this.createId();
    const primary: ITicket = {
      id: primaryId,
      name: item.name,
      addressId: item.addressId,
      birthDate: item.birthDate,
      gender: item.gender,
      socialStatus: item.socialStatus,
      mobile: item.mobile,
      transportationId: item.transportationId,
      userNotes: item.userNotes,
      bookingDate: item.bookingDate,
      adminNotes: item.adminNotes,
      paid: item.paid,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      isMain: true,
      primaryId: primaryId,
      lastUpdateUserId: '',
      roomType: item.roomType,
      deletedBy: '',
      mainMemberName: ''
    };
    const batch = this.angularFirestore.firestore.batch();
    const primaryRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${primaryId}`).ref;
    batch.set(primaryRef, primary);
    if (isParticipantsExists) {
      item.participants.forEach(p => {
        const participant: Partial<ITicket> = {
          ...p,
          primaryId,
          isMain: false,
          id: this.createId(),
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.set(participantRef, participant);
      });
    }
    if (isChildrenExists) {
      item.children.forEach(p => {
        const child: Partial<ITicket> = {
          ...p,
          primaryId,
          isMain: false,
          id: this.createId()
        };
        const childRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${child.id}`).ref;
        batch.set(childRef, child);
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  softDeleteReservation(id: string): Observable<void> {
    const userId = localStorage.getItem('userId') ?? '';
    const collectionRef = this.angularFirestore.collection(Constants.RealtimeDatabase.tickets).ref;
    const query = collectionRef.where('primaryId', '==', id);
    return from(query.get().then((querySnapshot) => {
      const batch = this.angularFirestore.firestore.batch();
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          bookingStatus: BookingStatus.deleted,
          deletedBy: userId
        });
      });
      return batch.commit();
    }));
  }

  updateDoc(path: string, data: PartialWithFieldValue<any>): Observable<any> {
    const docRef = doc(this.firestore, path);
    return from(updateDoc(docRef, data));
  }

  updateDocumentProperty(collectionPath: string, docId: string, propertyName: string, propertyValue: any): Observable<unknown> {
    const documentRef = this.angularFirestore.collection(collectionPath).doc(docId);
    return from(documentRef.update({
      [propertyName]: propertyValue
    }));
  }

  updateDocumentsProperty(collectionPath: string, docIds: string[], propertyName: string, propertyValue: any): Observable<void> {
    const batch = this.angularFirestore.firestore.batch();
    const collectionRef = this.angularFirestore.collection(collectionPath).ref;
    docIds.forEach((docId) => {
      const documentRef = collectionRef.doc(docId);
      batch.update(documentRef, { [propertyName]: propertyValue });
    });
    return from(batch.commit());
  }

  delete(path: string): Observable<void> {
    return from(this.angularFirestore.doc(path).delete());
  }

  getPrimaryWithRelatedParticipants(primaryId: string): Observable<ITicket[]> {
    const coll = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const documentQuery = query(coll, where('primaryId', '==', primaryId));
    const options = { idField: 'id' } as SnapshotOptions;
    return collectionData(documentQuery, options).pipe(first()) as Observable<ITicket[]>;
  }

  getDeletedMembers(): Observable<ITicket[]> {
    const ticketColl = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const userColl = collection(this.firestore, Constants.RealtimeDatabase.users);
    const documentQuery = query(ticketColl, where('bookingStatus', '==', BookingStatus.deleted));
    const options = { idField: 'id' } as SnapshotOptions;
    const ticketData$ = collectionData(documentQuery, options).pipe(first()) as Observable<ITicket[]>;
    const userData$ = collectionData(userColl, options).pipe(first()) as Observable<IUser[]>;
    return combineLatest([ticketData$, userData$]).pipe(
      map(([tickets, users]) => {
        const userMap = new Map(users.map(user => [user.id, user.fullName]));
        return tickets.map(ticket => ({
          ...ticket,
          deletedBy: ticket.deletedBy ? userMap.get(ticket.deletedBy) ?? '' : '',
          mainMemberName: ticket.isMain ? '' : tickets.find(m => m.id === ticket.primaryId)?.name ?? ''
        }));
      })
    );
  }

  getRelatedMembersByPrimaryId(primaryId: string, takeCount = 1): Observable<Array<IRelatedMemberViewModel>> {
    return this.angularFirestore
      .collection<ITicket>(Constants.RealtimeDatabase.tickets, ref =>
        ref.where('primaryId', '==', primaryId)
      ).valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<ITicket>) =>
          tickets.filter(c => !c.isMain).map((ticket: IRelatedMemberViewModel) => ({
            id: ticket.id,
            primaryId: ticket.primaryId,
            name: ticket.name,
            birthDate: ticket.birthDate,
            transportationId: ticket.transportationId,
          }))
        ),
        take(takeCount)
      );
  }

  getMembersByPrimaryId(primaryId: string, takeCount = 1): Observable<Array<IMemberRoomDataSource>> {
    return this.angularFirestore
      .collection<ITicket>(Constants.RealtimeDatabase.tickets, ref =>
        ref.where('primaryId', '==', primaryId)
      ).valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<ITicket>) =>
          tickets.map((ticket: IMemberRoomDataSource) => ({
            id: ticket.id,
            primaryId: ticket.primaryId,
            name: ticket.name,
            isMain: ticket.isMain,
            roomId: ticket.roomId,
            birthDate: ticket.birthDate
          }))
        ),
        take(takeCount)
      );
  }

  // async getTicketCount(): Promise<number> {
  //   const coll = collection(this.firestore, Constants.RealtimeDatabase.tickets);
  //   const snapshot = await getCountFromServer(coll);
  //   return snapshot.data().count;
  // }

  getAge(birthDate: Timestamp): number {
    return new Date().getFullYear() - birthDate.toDate().getFullYear();
  }

  uploadRooms(data: Array<IRoomDataSource>): Observable<unknown> {
    const batch = this.angularFirestore.firestore.batch();
    data.forEach((doc) => {
      const docRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.rooms}/${doc.id}`).ref;
      batch.set(docRef, doc);
    });
    return from(batch.commit()).pipe(map(() => null));
  }

  deleteAllRooms(data: Array<IRoomDataSource>): Observable<unknown> {
    const batch = this.angularFirestore.firestore.batch();
    data.forEach((doc) => {
      const docRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.rooms}/${doc.id}`).ref;
      batch.delete(docRef);
    });
    return from(batch.commit()).pipe(map(() => null));
  }
}
