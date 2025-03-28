import { Component, Inject, input, Input } from '@angular/core';

import { Constants } from '@app/constants';
import { IAllSubscriptionDataSourceVm } from '@app/models';
import { IConferenceProgram } from 'app/admin/conference-program/conference-program.models';
import { WINDOW } from 'app/shared/services/window.service';

@Component({
    selector: 'app-social-media',
    templateUrl: './social-media.component.html',
    styleUrls: ['./social-media.component.scss'],
    standalone: false
})
export class SocialMediaComponent {

  @Input() mobile: string = '';
  readonly conferenceProgram = input<IConferenceProgram>();
  readonly user = input<IAllSubscriptionDataSourceVm>();

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

  sendConferenceProgram(): void {
    const user = this.user();
    const program = this.conferenceProgram();
    if (this.mobile != '' && program && user) {
      const displayedRoomName = user.displayedRoomName;
      const match = displayedRoomName.match(/R:(\d+).*B:([A-Z]).*F:(\d+)/);
      const room = match ? match[1] : '';
      const building = match ? match[2] : '';
      const floor = match ? match[3] : '';
      const message = encodeURIComponent(`
        مساء الخير ${user.name}
        
        نود ارسال برنامج المؤتمر لك
        
        الموقع: ${program.locationUrl}
        
        صورة البرنامج (اضغط لعرضها): ${program.imageUrl}
        
        الغرفة: ${room}
        المبنى: ${building}
        الطابق: ${floor}
      `);
      this.window.open(`${Constants.SocialMedia.sendWhatsApp}text=${message}&phone=+2${this.mobile}`, '_blank');
    }
  }
}
