import { Injectable } from '@angular/core';
import { Observable, first, from, map, take } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, Query, query, where, CollectionReference } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, QueryFn } from '@angular/fire/compat/firestore';

import { Constants } from '@app/constants';
import { ICollectionData, ITicket, ITicketForm } from '@app/models';
import { convertSnaps } from './db-utils';

@Injectable({
  providedIn: 'root'
})
export class FireStoreService {

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore,
  ) { }

  createId(): string {
    return this.angularFirestore.createId();
  }

  getAll<T>(collectionName: string): Observable<Array<T>> {
    return this.angularFirestore.collection(collectionName).snapshotChanges().pipe(
      map(snaps => convertSnaps<T>(snaps)),
      first()
    );
  }

  addDoc<T>(collectionName: string, data: PartialWithFieldValue<any>): Observable<DocumentReference<T>> {
    return from(addDoc(this.getCollection(collectionName), data));
  }

  updateTicket(item: ITicketForm): Observable<unknown> {
    const isParticipantsExists = item.participants && item.participants.length > 0;
    const childrenCounts = item.participants?.filter(p => p.isChild).length ?? 0;
    const adultsCounts = item.participants?.filter(p => !p.isChild).length ?? 0;
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
      total: item.total,
      paid: item.paid,
      remaining: item.remaining,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      needsSeparateBed: true,
      isChild: false,
      isMain: true,
      primaryId: item.id
    };
    batch.set(primaryRef, primary);
    if (isParticipantsExists) {
      item.participants.forEach(p => {
        const participant: ITicket = {
          ...p,
          bookingDate: primary.bookingDate,
          adminNotes: primary.adminNotes,
          total: primary.total,
          paid: primary.paid,
          remaining: primary.remaining,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          adultsCount: adultsCounts,
          childrenCount: childrenCounts,
          isMain: false,
          primaryId: primary.id
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.update(participantRef, {...participant});
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  addTicket(item: ITicketForm): Observable<unknown> {
    const isParticipantsExists = item.participants && item.participants.length > 0;
    const childrenCounts = item.participants?.filter(p => p.isChild).length ?? 0;
    const adultsCounts = item.participants?.filter(p => !p.isChild).length ?? 0;
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
      total: item.total,
      paid: item.paid,
      remaining: item.remaining,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      needsSeparateBed: true,
      isChild: false,
      isMain: true,
      primaryId: primaryId
    };
    const batch = this.angularFirestore.firestore.batch();
    const primaryRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${primaryId}`).ref;
    batch.set(primaryRef, primary);
    if (isParticipantsExists) {
      item.participants.forEach(p => {
        const participant: ITicket = {
          ...p,
          id: this.createId(),
          bookingDate: primary.bookingDate,
          adminNotes: primary.adminNotes,
          total: primary.total,
          paid: primary.paid,
          remaining: primary.remaining,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          adultsCount: adultsCounts,
          childrenCount: childrenCounts,
          isMain: false,
          primaryId: primaryId
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.set(participantRef, participant);
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  deleteReservation(ids: Array<string>): Observable<unknown> {
    const batch = this.angularFirestore.firestore.batch();
    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const ref = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${id}`).ref;
        batch.delete(ref);
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  updateDoc(path: string, data: PartialWithFieldValue<any>): Observable<any> {
    const docRef = doc(this.firestore, path);
    return from(updateDoc(docRef, data));
  }

  delete(path: string): Observable<void> {
    return from(this.angularFirestore.doc(path).delete());
  }


  getPrimaryWithRelatedParticipants(primaryId: string): Observable<Array<ITicket>> {
    return this.angularFirestore
      .collection<ITicket>(Constants.RealtimeDatabase.tickets, ref =>
        ref.where('primaryId', '==', primaryId)
      )
      .valueChanges({ idField: 'id' });
  }

  getAllSubscription(): Observable<Array<Partial<ITicket>>> {
    return this.angularFirestore
      .collection<ITicket>(Constants.RealtimeDatabase.tickets, ref => 
        ref.orderBy('bookingDate', 'asc')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<ITicket>) =>
          tickets.map((ticket: ITicket) => ({
            name: ticket.name,
            mobile: ticket.mobile,
            birthDate: ticket.birthDate,
            roomId: ticket.roomId,
            bookingStatus: ticket.bookingStatus,
            age: new Date().getFullYear() - ticket.birthDate.toDate().getFullYear(),
            gender: ticket.gender,
            isMain: ticket.isMain,
            isChild: ticket.isChild
          }))
        ),
        take(1)
      );
  }

  getPrimarySubscription(takeCount = 1): Observable<Array<Partial<ITicket>>> {
    return this.angularFirestore
      .collection<ITicket>(Constants.RealtimeDatabase.tickets, ref => 
        ref.where('isMain', '==', true)
      ).valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<ITicket>) =>
          tickets.map((ticket: ITicket) => ({
            id: ticket.id,
            name: ticket.name,
            adultsCount: ticket.adultsCount,
            childrenCount: ticket.childrenCount,
            roomId: ticket.roomId,
            bookingType: ticket.bookingType,
            bookingStatus: ticket.bookingStatus,
            bookingDate: ticket.bookingDate,
            totalCost: 0,
            paid: ticket.paid,
            remaining: ticket.remaining,
            userNotes: ticket.userNotes
          }))
        ),
        take(takeCount)
      );
  }

  // getTicketCount(): Observable<number> {
  //   return this.angularFirestore.collection(Constants.RealtimeDatabase.tickets).get().pipe(map(snaps => snaps.size));
  // }

  collection<T>(path: string, queryFn?: QueryFn): AngularFirestoreCollection<T> {
    return this.angularFirestore.collection(path, queryFn);
  }

  getCollectionData(options: ICollectionData): Observable<Array<DocumentData>> {
    const documentQuery = query(this.getCollection(options.collectionName), where(options.fieldPath, options.opStr, options.value));
    return this.collectionData(documentQuery, { idField: options.idField }) as Observable<Array<DocumentData>>;
  }

  private collectionData<T = DocumentData>(query: Query<T>, options?: { idField?: string; }): Observable<T[]> {
    return collectionData(query, options);
  }

  private getCollection(collectionName: string): CollectionReference<DocumentData> {
    return collection(this.firestore, collectionName);
  }
}
