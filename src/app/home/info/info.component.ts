import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISettings } from '@app/models';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {

  @Input() settings: Array<ISettings> = [] as Array<ISettings>;
  @Output() showForm: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  showTicketForm(): void {
    this.showForm.emit(true);
  }

}
