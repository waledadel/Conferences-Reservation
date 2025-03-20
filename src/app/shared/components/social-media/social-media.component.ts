import { Component, Inject, Input } from '@angular/core';

import { Constants } from '@app/constants';
import { WINDOW } from 'app/shared/services/window.service';

@Component({
    selector: 'app-social-media',
    templateUrl: './social-media.component.html',
    styleUrls: ['./social-media.component.scss'],
    standalone: false
})
export class SocialMediaComponent {

  @Input() mobile: string = '';

  constructor(@Inject(WINDOW) private window: Window) {}

  openWhatsApp(): void {
    if (this.mobile != '') {
      this.window.open(`${Constants.SocialMedia.whatsApp}+2${this.mobile}`, '_blank');
    }
  }

  openViber(): void {
    if (this.mobile != '') {
      this.window.open(`${Constants.SocialMedia.viber}2${this.mobile}`, '_blank');
    }
  }

  openTelegram(): void {
    if (this.mobile != '') {
      this.window.open(`${Constants.SocialMedia.telegram}+2${this.mobile}`, '_blank');
    }
  }
}
