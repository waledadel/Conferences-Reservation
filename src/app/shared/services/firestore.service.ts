import { Constants } from '@app/constants';
import { Injectable } from '@angular/core';
import { Observable, first, from, map } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, Query, query, where, CollectionReference } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, QueryFn } from '@angular/fire/compat/firestore';

import { ICollectionData, ITicket } from '@app/models';
import { convertSnaps } from './db-utils';


@Injectable({
  providedIn: 'root'
})
export class FireStoreService {

  constructor(
    private firestore: Firestore,
    private angularFirestore: AngularFirestore,
  ) { }

  getAll<T>(collectionName: string): Observable<Array<T>> {
    return this.angularFirestore.collection(collectionName).snapshotChanges().pipe(
      map(snaps => convertSnaps<T>(snaps)),
      first()
    );
  }

  addDoc<T>(collectionName: string, data: PartialWithFieldValue<any>): Observable<DocumentReference<T>> {
    return from(addDoc(this.getCollection(collectionName), data));
  }

  async addTicket(ticket: ITicket): Promise<unknown> {
    const ticketsCollection = this.angularFirestore.collection<ITicket>(Constants.RealtimeDatabase.tickets);
    return ticketsCollection.add(ticket).then(async (docRef) => {
      const participantsCollection = docRef.collection(Constants.RealtimeDatabase.participants);
      const participantsData = ticket.participants.map((participant) => ({ ...participant }));
      const addParticipantPromises = participantsData.map((participant) => participantsCollection.add(participant));
      await Promise.all(addParticipantPromises);
      return docRef;
    });
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
