import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, first, from, map, take } from 'rxjs';
import { DocumentReference, PartialWithFieldValue, query, SnapshotOptions, where, writeBatch, Timestamp, DocumentData, deleteDoc, getDocs } from 'firebase/firestore';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, docData } from '@angular/fire/firestore';

import { Constants } from '@app/constants';
import { IRelatedMemberViewModel, ITicket, ITicketForm, IUser, IRoomDataSource, IMemberRoomDataSource, BookingStatus } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class FireStoreService {

  private readonly firestore = inject(Firestore);

  createId(): string {
    return doc(collection(this.firestore, 'randomId')).id;
  }

  getAll<T>(endPoint: string): Observable<T[]> {
    const coll = collection(this.firestore, endPoint);
    // orderBy('bookingDate', 'desc'), limit(10)
    const documentQuery = query(coll);
    const options = { idField: 'id' } as SnapshotOptions;
    return collectionData(documentQuery, options).pipe(take(1)) as Observable<T[]>;
  }

  getById(path: string): Observable<any> {
    return docData(this.getDocRef(path), { idField: 'id' }) as Observable<any>;
  }

  getSingletonDocument<T>(path: string): Observable<T> {
    const colRef = collection(this.firestore, path);
    return from(getDocs(colRef)).pipe(
      map(snapshot => {
        const docSnap = snapshot.docs[0];
        if (!docSnap) {
          throw new Error(`No document found in collection: ${path}`);
        }
        return {
          ...docSnap.data(),
          id: docSnap.id
        } as T;
      })
    );
  }

  getUserByEmail(email: string): Observable<IUser | null> {
    const usersCollectionRef = collection(this.firestore, Constants.RealtimeDatabase.users);
    const q = query(usersCollectionRef, where('email', '==', email));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const docSnap = snapshot.docs[0];
        if (docSnap) {
          const data = docSnap.data() as IUser;
          return {
            ...data,
            id: docSnap.id
          };
        } else {
          return null;
        }
      })
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
    const childrenCounts = item.children?.length ?? 0;
    const adultsCounts = item.participants?.length ?? 0;
    const batch = writeBatch(this.firestore);
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
    batch.set(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${item.id}`), primary);
    if (isParticipantsExists) {
      const participantsWithIds = item.participants.filter(p => !!p.id);
      participantsWithIds.forEach(participant => {
        const participantData: Partial<ITicket> = {
          ...participant,
          isMain: false
        };
        batch.update(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${participant.id}`), participantData);
      });
      const newParticipants = item.participants.filter(p => !p.id);
      if (newParticipants && newParticipants.length > 0) {
        const newId = this.createId();
        newParticipants.forEach(p => {
          const participant: Partial<ITicket> = {
            ...p,
            id: newId,
            isMain: false,
            primaryId: primary.id,
          };
          batch.set(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${participant.id}`), participant);
        });
      }
    }
    if (isChildrenExists) {
      const childrenWithIds = item.children.filter(c => !!c.id);
      childrenWithIds.forEach(p => {
        const child: Partial<ITicket> = {
          ...p,
          isMain: false
        };
        batch.update(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${child.id}`), { ...child });
      });
      const newChildren = item.children.filter(c => !c.id);
      if (newChildren && newChildren.length > 0) {
        item.children.filter(t => t.id == '').forEach(p => {
          const child: Partial<ITicket> = {
            ...p,
            id: this.createId(),
            isMain: false,
            primaryId: primary.id,
          };
          batch.set(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${child.id}`), { ...child });
        });
      }
    }
    if (removedIds && removedIds.length > 0) {
      removedIds.filter(id => id != '' && id != null).forEach(item => {
        if (item && item != '') {
          batch.delete(this.getDocRef(`${Constants.RealtimeDatabase.tickets}/${item}`));
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
    const batch = writeBatch(this.firestore);
    batch.set(this.getDocRef(`/${Constants.RealtimeDatabase.tickets}/${primaryId}`), primary);
    if (isParticipantsExists) {
      item.participants.forEach(p => {
        const participant: Partial<ITicket> = {
          ...p,
          primaryId,
          isMain: false,
          id: this.createId(),
        };
        batch.set(this.getDocRef(`/${Constants.RealtimeDatabase.tickets}/${participant.id}`), participant);
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
        batch.set(this.getDocRef(`/${Constants.RealtimeDatabase.tickets}/${child.id}`), child);
      });
    }
    return from(batch.commit()).pipe(map(() => null));
  }

  softDeleteReservation(id: string): Observable<void> {
    const userId = localStorage.getItem('userId') ?? '';
    const ticketsCollectionRef = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const q = query(ticketsCollectionRef, where('primaryId', '==', id));
    return from(
      getDocs(q).then((querySnapshot) => {
        const batch = writeBatch(this.firestore);
        querySnapshot.forEach((docSnap) => {
          const documentRef = doc(this.firestore, `${Constants.RealtimeDatabase.tickets}/${docSnap.id}`);
          batch.update(documentRef, {
            bookingStatus: BookingStatus.deleted,
            deletedBy: userId,
          });
        });
        return batch.commit();
      })
    );
  }

  updateDoc(path: string, data: PartialWithFieldValue<any>): Observable<any> {
    return from(updateDoc(this.getDocRef(path), data));
  }

  updateDocumentProperty(path: string, docId: string, propertyName: string, propertyValue: any): Observable<unknown> {
    const documentRef = this.getDocRef(`${path}/${docId}`);
    return from(updateDoc(documentRef, {
      [propertyName]: propertyValue
    }));
  }

  updateDocumentsProperty(collectionPath: string, docIds: string[], propertyName: string, propertyValue: any): Observable<void> {
    const batch = writeBatch(this.firestore);
    const collectionRef = collection(this.firestore, collectionPath);
    docIds.forEach((docId) => {
      const documentRef = doc(collectionRef, docId);
      batch.update(documentRef, { [propertyName]: propertyValue });
    });
    return from(batch.commit());
  }

  delete(path: string): Observable<void> {
    return from(deleteDoc(this.getDocRef(path)));
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
    const ticketsCollectionRef = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const q = query(ticketsCollectionRef, where('primaryId', '==', primaryId));
    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(docSnap => {
          const data = docSnap.data() as ITicket;
          return {
            ...data,
            id: docSnap.id
          };
        })
      ),
      map((tickets: ITicket[]) => 
        tickets
          .filter(c => !c.isMain)
          .map(ticket => ({
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
    const ticketsCollectionRef = collection(this.firestore, Constants.RealtimeDatabase.tickets);
    const q = query(ticketsCollectionRef, where('primaryId', '==', primaryId));
    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(docSnap => {
          const data = docSnap.data() as ITicket;
          return {
            ...data,
            id: docSnap.id
          };
        })
      ),
      map((tickets: ITicket[]) =>
        tickets.map(ticket => ({
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
    const batch = writeBatch(this.firestore);
    data.forEach((doc) => {
      batch.set(this.getDocRef(`/${Constants.RealtimeDatabase.rooms}/${doc.id}`), doc);
    });
    return from(batch.commit()).pipe(map(() => null));
  }

  deleteAllRooms(data: Array<IRoomDataSource>): Observable<unknown> {
    const batch = writeBatch(this.firestore);
    data.forEach((doc) => {
      const docRef = this.getDocRef(`/${Constants.RealtimeDatabase.rooms}/${doc.id}`);
      batch.delete(docRef);
    });
    return from(batch.commit()).pipe(map(() => null));
  }

  private getDocRef(path: string): DocumentReference<DocumentData, DocumentData> {
    return doc(this.firestore, path);
  }
}
