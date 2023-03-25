import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { AuthService } from '@app/services';
import { Constants } from '@app/constants';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkIfCanActiveUrl();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkIfCanActiveUrl();
  }

  private checkIfCanActiveUrl(): Observable<boolean> {
    return this.authService.isLoggedIn.pipe(
      filter(val => val !== null),
      take(1),
      map(isAuth => {
        if (isAuth) {
          this.router.navigateByUrl(`${Constants.Routes.secure}/${Constants.Routes.primary}` , { replaceUrl: true });
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
