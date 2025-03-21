import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, first, forkJoin, from, map, switchMap, take } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, query, SnapshotOptions, where } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, docData } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';

import { Constants } from '@app/constants';
import { IRelatedMemberViewModel, IPrimaryDataSourceVm, ITicket, ITicketForm, IAllSubscriptionDataSourceVm, IUser, IRoomDataSource, IMemberRoomDataSource, BookingStatus, IDeletedMembersDataSourceVm } from '@app/models';

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
      roomType: item.roomType
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
      roomType: item.roomType
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

  getAllMembers(): Observable<Array<IAllSubscriptionDataSourceVm>> {
    // , ref => ref.where('bookingStatus', '<', BookingStatus.deleted).orderBy('bookingStatus', 'asc')

    return this.angularFirestore.collection<IAllSubscriptionDataSourceVm>(Constants.RealtimeDatabase.tickets).valueChanges({ idField: 'id' }).pipe(
        map((tickets: Array<IAllSubscriptionDataSourceVm>) =>
          tickets.filter(t => t.bookingStatus !== BookingStatus.deleted).map((ticket: IAllSubscriptionDataSourceVm) => ({
            id: ticket.id,
            name: ticket.name,
            mobile: ticket.mobile,
            birthDate: ticket.birthDate,
            roomId: ticket.roomId,
            bookingStatus: ticket.bookingStatus,
            age: this.getAge(ticket.birthDate),
            gender: ticket.gender,
            isMain: ticket.isMain,
            addressId: ticket.addressId,
            address: '',
            transportationId: ticket.transportationId,
            transportationName: '',
            birthDateMonth: ticket.birthDate.toDate().getMonth() + 1,
            mainMemberName: '',
            primaryId: ticket.primaryId,
            displayedRoomName: '',
            totalCost: 0,
            paid: ticket.paid,
            remaining: 0,
            roomType: ticket.roomType,
            adminNotes: ticket.adminNotes,
            userNotes: ticket.userNotes,
            bookingType: ticket.bookingType,
            bookingDate: ticket.bookingDate
          }))
        ),
        take(1)
      );
  }

  getDeletedMembers(takeCount = 1): Observable<Array<IDeletedMembersDataSourceVm>> {
    const usersRef = this.angularFirestore.collection<IUser>(Constants.RealtimeDatabase.users).ref;
    return this.angularFirestore
      .collection<IDeletedMembersDataSourceVm>(Constants.RealtimeDatabase.tickets, ref =>
        ref.where('bookingStatus', '==', BookingStatus.deleted)
      ).valueChanges({ idField: 'id' })
      .pipe(
        switchMap((tickets: Array<IDeletedMembersDataSourceVm>) => {
          return combineLatest(
            tickets.map((ticket: IDeletedMembersDataSourceVm) => {
              const userId = ticket.deletedBy;
              const usersDoc = usersRef.doc(userId);
              return forkJoin([
                from(usersDoc.get()).pipe(
                  map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                  }) as IUser)
                )
              ]);
            })
          ).pipe(
            map((results: Array<[IUser]>) =>
              tickets.map((ticket: IDeletedMembersDataSourceVm, index: number) => {
                const [user] = results[index];
                return {
                  id: ticket.id,
                  name: ticket.name,
                  mobile: ticket.mobile,
                  isMain: ticket.isMain,
                  isChild: ticket.isChild,
                  mainMemberName: '',
                  primaryId: ticket.primaryId,
                  displayedRoomName: '',
                  deletedBy: ticket.deletedBy ? user.fullName : '',
                };
              })
            ),
            take(takeCount)
          );
        })
      );
  }

  getPrimaryMembers(takeCount = 1): Observable<Array<IPrimaryDataSourceVm>> {
    return this.angularFirestore
      .collection<IPrimaryDataSourceVm>(Constants.RealtimeDatabase.tickets, ref =>
        ref.where('isMain', '==', true).where('bookingStatus', '<', BookingStatus.deleted)
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
            mainMemberName: '',
            remaining: 0,
            roomType: ticket.roomType
          }))
        ),
        take(takeCount)
      );
  }

  getNotPrimaryMembers(): Observable<IRelatedMemberViewModel[]> {
    const coll = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const documentQuery = query(coll, where('isMain', '==', false));
    const options = { idField: 'id' } as SnapshotOptions;
    return collectionData(documentQuery, options) as Observable<IRelatedMemberViewModel[]>;
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

  // collection<T>(path: string, queryFn?: QueryFn): AngularFirestoreCollection<T> {
  //   return this.angularFirestore.collection(path, queryFn);
  // }

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
