import { Injectable } from '@angular/core';
import { Observable, first, from, map, take } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, Query, query, where, CollectionReference } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, docData, getCountFromServer } from '@angular/fire/firestore';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, QueryFn } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { ICollectionData, IRelatedMemberViewModel, IPrimaryDataSourceVm, ITicket, ITicketForm, IAllSubscriptionDataSourceVm, IUser, IRoomDataSource, IMemberRoomDataSource, BookingStatus, IDeletedMembersDataSourceVm } from '@app/models';
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
    return from(addDoc(this.getCollection(collectionName), data));
  }

  updateTicket(item: ITicketForm, removedIds: Array<string>): Observable<unknown> {
    const currentLoggedInUser = localStorage.getItem('userId');
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
      paid: item.paid,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      needsSeparateBed: true,
      isChild: false,
      isMain: true,
      primaryId: item.id,
      lastUpdateDate: Timestamp.fromDate(new Date()),
      lastUpdateUserId: currentLoggedInUser ?? ''
    };
    batch.set(primaryRef, primary);
    if (isParticipantsExists) {
      item.participants.filter(t => t.id != '' && t.id != null).forEach(p => {
        const participant: ITicket = {
          ...p,
          bookingDate: primary.bookingDate,
          adminNotes: primary.adminNotes,
          paid: primary.paid,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          adultsCount: adultsCounts,
          childrenCount: childrenCounts,
          isMain: false,
          primaryId: primary.id,
          lastUpdateUserId: currentLoggedInUser ?? ''
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.update(participantRef, {...participant});
      });
      const newMembersAddedByAdmin = item.participants.filter(t => t.id == '');
      if (newMembersAddedByAdmin && newMembersAddedByAdmin.length > 0) {
        item.participants.filter(t => t.id == '').forEach(p => {
          const participant: ITicket = {
            ...p,
            id: this.createId(),
            bookingDate: primary.bookingDate,
            adminNotes: primary.adminNotes,
            paid: primary.paid,
            bookingStatus: primary.bookingStatus,
            bookingType: primary.bookingType,
            roomId: primary.roomId,
            adultsCount: adultsCounts,
            childrenCount: childrenCounts,
            isMain: false,
            primaryId: primary.id,
            lastUpdateUserId: currentLoggedInUser ?? ''
          };
          const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
          batch.set(participantRef, {...participant});
        });
      }
    }
    if (removedIds && removedIds.length > 0) {
      removedIds.forEach(item => {
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${item}`).ref;
        batch.delete(participantRef);
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
      paid: item.paid,
      bookingStatus: item.bookingStatus,
      bookingType: item.bookingType,
      roomId: item.roomId,
      adultsCount: adultsCounts,
      childrenCount: childrenCounts,
      needsSeparateBed: true,
      isChild: false,
      isMain: true,
      primaryId: primaryId,
      lastUpdateUserId: ''
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
          paid: primary.paid,
          bookingStatus: primary.bookingStatus,
          bookingType: primary.bookingType,
          roomId: primary.roomId,
          adultsCount: adultsCounts,
          childrenCount: childrenCounts,
          isMain: false,
          primaryId: primaryId,
          lastUpdateUserId: ''
        };
        const participantRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`).ref;
        batch.set(participantRef, participant);
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  // deleteReservationForever(ids: Array<string>): Observable<unknown> {
  //   const batch = this.angularFirestore.firestore.batch();
  //   if (ids && ids.length > 0) {
  //     ids.forEach(id => {
  //       const ref = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.tickets}/${id}`).ref;
  //       batch.delete(ref);
  //     });
  //   }
  //   return from(batch.commit()).pipe(map(() => null));
  // }

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
      batch.update(documentRef, {[propertyName]: propertyValue});
    });
    return from(batch.commit());
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

  getAllMembers(): Observable<Array<IAllSubscriptionDataSourceVm>> {
      return this.angularFirestore
      .collection<IAllSubscriptionDataSourceVm>(Constants.RealtimeDatabase.tickets, ref => 
        ref.where('bookingStatus', '<', BookingStatus.deleted).orderBy('bookingStatus', 'asc')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<IAllSubscriptionDataSourceVm>) =>
          tickets.map((ticket: IAllSubscriptionDataSourceVm) => ({
            id: ticket.id,
            name: ticket.name,
            mobile: ticket.mobile,
            birthDate: ticket.birthDate,
            roomId: ticket.roomId,
            bookingStatus: ticket.bookingStatus,
            age: this.getAge(ticket.birthDate),
            gender: ticket.gender,
            isMain: ticket.isMain,
            isChild: ticket.isChild,
            addressId: ticket.addressId,
            address: '',
            transportationId: ticket.transportationId,
            transportationName: '',
            birthDateMonth: ticket.birthDate.toDate().getMonth() + 1,
            mainMemberName: '',
            primaryId: ticket.primaryId,
            displayedRoomName: '',
            needsSeparateBed: ticket.needsSeparateBed
          }))
        ),
        take(1)
      );
  }

  getDeletedMembers(): Observable<Array<IDeletedMembersDataSourceVm>> {
    return this.angularFirestore
      .collection<IAllSubscriptionDataSourceVm>(Constants.RealtimeDatabase.tickets, ref => 
        ref.where('bookingStatus', '==', BookingStatus.deleted)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<IDeletedMembersDataSourceVm>) =>
          tickets.map((ticket: IDeletedMembersDataSourceVm) => ({
            id: ticket.id,
            name: ticket.name,
            mobile: ticket.mobile,
            isMain: ticket.isMain,
            isChild: ticket.isChild,
            mainMemberName: '',
            primaryId: ticket.primaryId,
            displayedRoomName: '',
          }))
        ),
        take(1)
      );
  }

  getPrimarySubscription(takeCount = 1): Observable<Array<IPrimaryDataSourceVm>> {
    return this.angularFirestore
      .collection<IPrimaryDataSourceVm>(Constants.RealtimeDatabase.tickets, ref => 
        ref.where('isMain', '==', true)
      ).valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<IPrimaryDataSourceVm>) =>
          tickets.map((ticket: IPrimaryDataSourceVm) => ({
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
            userNotes: ticket.userNotes,
            transportationId: ticket.transportationId,
            primaryId: ticket.primaryId,
            mobile: ticket.mobile,
            transportationName: '',
            gender: ticket.gender,
            birthDate: ticket.birthDate,
            age: this.getAge(ticket.birthDate),
            birthDateMonth: ticket.birthDate.toDate().getMonth() + 1,
            adminNotes: ticket.adminNotes,
            lastUpdateUserId: ticket.lastUpdateUserId ?? '',
            lastUpdateDate: ticket.lastUpdateDate,
            lastUpdatedBy: '',
            addressId: ticket.addressId,
            addressName: '',
            deletedBy: ticket.deletedBy ?? ''
          }))
        ),
        take(takeCount)
      );
  }

  // getPrimarySubscription(takeCount = 1): Observable<Array<IPrimaryDataSourceVm>> {
  //   const busRef = this.angularFirestore.collection<IBus>(Constants.RealtimeDatabase.buses).ref;
  //   const addressRef = this.angularFirestore.collection<IAddress>(Constants.RealtimeDatabase.address).ref;
  //   return this.angularFirestore
  //     .collection<IPrimaryDataSourceVm>(Constants.RealtimeDatabase.tickets, ref => 
  //       ref.where('isMain', '==', true)
  //     ).valueChanges({ idField: 'id' })
  //     .pipe(
  //       switchMap((tickets: Array<IPrimaryDataSourceVm>) => {
  //         return combineLatest(
  //           tickets.map((ticket: IPrimaryDataSourceVm) => {
  //             const transportationId = ticket.transportationId;
  //             const busDoc = busRef.doc(transportationId);
  //             const addressId = ticket.addressId;
  //             const addressDoc = addressRef.doc(addressId);
  //             return forkJoin([
  //               from(busDoc.get()).pipe(
  //                 map((doc) => ({
  //                   ...doc.data(),
  //                   id: doc.id,
  //                 }) as IBus)
  //               ),
  //               from(addressDoc.get()).pipe(
  //                 map((doc) => ({
  //                   ...doc.data(),
  //                   id: doc.id,
  //                 }) as IAddress)
  //               )
  //             ]);
  //           })
  //         ).pipe(
  //           map((results: Array<[IBus, IAddress]>) =>
  //             tickets.map((ticket: IPrimaryDataSourceVm, index: number) => {
  //               const [bus, address] = results[index];
  //               return {
  //                 id: ticket.id,
  //                 name: ticket.name,
  //                 adultsCount: ticket.adultsCount,
  //                 childrenCount: ticket.childrenCount,
  //                 roomId: ticket.roomId,
  //                 bookingType: ticket.bookingType,
  //                 bookingStatus: ticket.bookingStatus,
  //                 bookingDate: ticket.bookingDate,
  //                 totalCost: 0,
  //                 paid: ticket.paid,
  //                 userNotes: ticket.userNotes,
  //                 transportationId: ticket.transportationId,
  //                 primaryId: ticket.primaryId,
  //                 mobile: ticket.mobile,
  //                 transportationName: bus.name,
  //                 gender: ticket.gender,
  //                 birthDate: ticket.birthDate,
  //                 age: this.getAge(ticket.birthDate),
  //                 birthDateMonth: ticket.birthDate.toDate().getMonth() + 1,
  //                 adminNotes: ticket.adminNotes,
  //                 lastUpdateUserId: ticket.lastUpdateUserId ?? '',
  //                 lastUpdateDate: ticket.lastUpdateDate,
  //                 lastUpdatedBy: '',
  //                 addressId: ticket.addressId,
  //                 addressName: address.name,
  //                 deletedBy: ticket.deletedBy ?? '',
  //               };
  //             })
  //           ),
  //           take(takeCount)
  //         );
  //       })
  //     );
  // }

  getNotPrimarySubscription(takeCount = 1): Observable<Array<IRelatedMemberViewModel>> {
    return this.angularFirestore
      .collection<IRelatedMemberViewModel>(Constants.RealtimeDatabase.tickets, ref => 
        ref.where('isMain', '==', false)
      ).valueChanges({ idField: 'id' })
      .pipe(
        map((tickets: Array<IRelatedMemberViewModel>) =>
          tickets.map((ticket: IRelatedMemberViewModel) => ({
            id: ticket.id,
            primaryId: ticket.primaryId,
            name: ticket.name,
            birthDate: ticket.birthDate,
            needsSeparateBed: ticket.needsSeparateBed,
            transportationId: ticket.transportationId,
            isChild: ticket.isChild
          }))
        ),
        take(takeCount)
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
            needsSeparateBed: ticket.needsSeparateBed,
            transportationId: ticket.transportationId,
            isChild: ticket.isChild
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
            isChild: ticket.isChild,
            isMain: ticket.isMain,
            roomId: ticket.roomId,
            needsSeparateBed: ticket.needsSeparateBed,
            birthDate: ticket.birthDate
          }))
        ),
        take(takeCount)
      );
  }

  async getTicketCount(): Promise<number> {
    const coll = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  }

  // getTicketCount(): Observable<number> {
  //   return this.angularFirestore.collection(Constants.RealtimeDatabase.tickets).get().pipe(map(snaps => snaps.size));
  // }

  getAge(birthDate: Timestamp): number {
    return new Date().getFullYear() - birthDate.toDate().getFullYear();
  }

  collection<T>(path: string, queryFn?: QueryFn): AngularFirestoreCollection<T> {
    return this.angularFirestore.collection(path, queryFn);
  }

  getCollectionData(options: ICollectionData): Observable<Array<DocumentData>> {
    const documentQuery = query(this.getCollection(options.collectionName), where(options.fieldPath, options.opStr, options.value));
    return this.collectionData(documentQuery, { idField: options.idField }) as Observable<Array<DocumentData>>;
  }

  uploadRooms(data: Array<IRoomDataSource>): Observable<unknown> {
    const batch = this.angularFirestore.firestore.batch();
    data.forEach((doc) => {
      const docRef = this.angularFirestore.doc(`/${Constants.RealtimeDatabase.rooms}/${doc.id}`).ref;
      batch.set(docRef, doc);
    });
    return from(batch.commit()).pipe(map(() => null));
  }

  private collectionData<T = DocumentData>(query: Query<T>, options?: { idField?: string; }): Observable<T[]> {
    return collectionData(query, options);
  }

  private getCollection(collectionName: string): CollectionReference<DocumentData> {
    return collection(this.firestore, collectionName);
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
