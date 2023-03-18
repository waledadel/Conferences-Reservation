import { Component, Input, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { timer } from 'rxjs';

import { LoadingService } from './loading.service';

@Component({
  selector: 'w-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {

  @Input() routing = false;
  @Input() detectRoutingOngoing = false;

  constructor(public loadingService: LoadingService, private router: Router) { }

  ngOnInit(): void {
    if (this.detectRoutingOngoing) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart || event instanceof RouteConfigLoadStart) {
          this.loadingService.loadingOn();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel ||
          event instanceof RouteConfigLoadEnd
        ) {
          timer(300).subscribe(() => {
            this.loadingService.loadingOff();
          });
        }
      });
    }
  }

}
