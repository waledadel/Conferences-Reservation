import { Injectable } from '@angular/core';
import { Observable, first, from, map } from 'rxjs';
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

  addTicket(item: ITicketForm): Observable<unknown> {
    const isParticipantsExists = item.participants && item.participants.length > 0;
    const childrenCounts = item.participants?.filter(p => p.isChild).length ?? 0;
    const adultsCounts = item.participants?.filter(p => !p.isChild).length ?? 0;
    const primary: ITicket = {
      id: this.createId(),
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
      ticketStatus: item.ticketStatus,
      ticketType: item.ticketType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      needsSeparateBed: true,
      isChild: false,
      isMain: true,
      primaryId: ''
    };
    const batch = this.angularFirestore.firestore.batch();
    const primaryRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${primary.id}`).ref;
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
          ticketStatus: primary.ticketStatus,
          ticketType: primary.ticketType,
          roomId: primary.roomId,
          adultsCount: adultsCounts,
          childrenCount: childrenCounts,
          isMain: false,
          primaryId: primary.id
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.set(participantRef, participant);
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
