import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private titleSubject = new BehaviorSubject<string>('');
  title = this.titleSubject.asObservable();

  updatePageTitle(title: string): void {
    this.titleSubject.next(title);
  }
}
