import { Injectable } from '@angular/core';
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/compat/database'
import { Observable, map } from 'rxjs';

import { Constants } from '@app/constants';
import { IUser } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  constructor(private db: AngularFireDatabase) {}

  create<T>(path: string, data: T): any {
    return this.db.list(path).push(data);
  }

  update<T>(path: string, key: string, data: Partial<T>): Promise<void> {
    return this.db.list(path).update(key, data);
  }

  delete(path: string, key: string): Promise<void> {
    return this.db.list(path).remove(key);
  }

  getAll<T>(path: string): Observable<Array<T>> {
    return this.db.list(path).snapshotChanges().pipe(
      map((changes: SnapshotAction<any>[]) => 
        changes.map(t => 
          ({id: t.payload.key, ...t.payload.val() })
        )
      )
    );
  }

  async removeUser(user: IUser): Promise<void> {
    await this.db.list(Constants.RealtimeDatabase.users).remove(user.id);
  }
}
