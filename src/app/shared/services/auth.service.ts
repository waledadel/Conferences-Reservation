import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, timer } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseError } from '@angular/fire/app';
import firebase from 'firebase/compat';

import { Constants } from '@app/constants';
import { LogoutComponent } from '../components/logout/logout.component';
import { NotifyService } from './notify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn: Observable<boolean>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private dialog: MatDialog,
    private notifyService: NotifyService
  ) {
    this.isLoggedIn = angularFireAuth.authState.pipe(map(user => !!user));
  }

  async login(email: string, password: string): Promise<void> {
    this.angularFireAuth.signInWithEmailAndPassword(email, password).then((data: firebase.auth.UserCredential) => {
      if (data && data.user) {
        localStorage.setItem('userId', data.user.uid);
        this.router.navigateByUrl(`${Constants.Routes.secure}/${Constants.Routes.primary}`);
      }
    }).catch((error: FirebaseError) => {
      this.showErrorMessage(error.code);
    });
  }

  async logout(): Promise<void> {
    const dialogRef = this.dialog.open(LogoutComponent, {
      panelClass: 'customDialogPanelClass-md',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: {logout: boolean}) => {
      if (result && result.logout) {
        this.angularFireAuth.signOut();
        localStorage.clear();
        this.router.navigateByUrl(Constants.Routes.login);
        timer(100).subscribe(() => {
          window.location.reload();
        });
      }
    });
  }

  private showErrorMessage(errorCode: string): void {
    switch (errorCode) {
      case 'auth/wrong-password':
        this.notifyService.showNotifier('Invalid login credentials.', 'danger');
        break;
      case 'auth/network-request-failed':
        this.notifyService.showNotifier('Please check your internet connection', 'danger');
        break;
      case 'auth/too-many-requests':
        this.notifyService.showNotifier(
          'We have detected too many requests from your device. Take a break please!', 'danger');
        break;
      case 'auth/user-disabled':
        this.notifyService.showNotifier(
          'Your account has been disabled or deleted. Please contact the system administrator.', 'danger');
        break;
      case 'auth/requires-recent-login':
        this.notifyService.showNotifier('Please login again and try again!', 'danger');
        break;
      case 'auth/email-already-exists':
        this.notifyService.showNotifier('Email address is already in use by an existing user.', 'danger');
        break;
      case 'auth/user-not-found':
        this.notifyService.showNotifier('User not found.', 'danger');
        break;
      case 'auth/phone-number-already-exists':
        this.notifyService.showNotifier('The phone number is already in use by an existing user.', 'danger');
        break;
      case 'auth/invalid-phone-number':
        this.notifyService.showNotifier('The phone number is not a valid phone number!', 'danger');
        break;
      case 'auth/invalid-email  ':
        this.notifyService.showNotifier('The email address is not a valid email address!', 'danger');
        break;
      case 'auth/cannot-delete-own-user-account':
        this.notifyService.showNotifier('You cannot delete your own user account.', 'danger');
        break;
      case 'auth/email-already-in-use':
        this.notifyService.showNotifier('This email address already have an account.', 'danger');
        break;
      case 'auth/configuration-not-found':
        this.notifyService.showNotifier('account.configurationNotFound', 'warning');
        break;
      default:
        this.notifyService.showNotifier('Oops! Something went wrong. Try again later.', 'danger');
      break;
    }
  }


}
