import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './modal.component.html'
})
export class ModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
