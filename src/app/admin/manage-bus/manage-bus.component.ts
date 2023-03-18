import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Constants } from '@app/constants';
import { IBus } from '@app/models';
import { NotifyService, BaseService, TranslationService } from '@app/services';

@Component({
  selector: 'app-manage-bus',
  templateUrl: './manage-bus.component.html',
  styleUrls: ['./manage-bus.component.scss']
})
export class ManageBusComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManageBusComponent>,
    private formBuilder: FormBuilder,
    private baseService: BaseService,
    private notifyService: NotifyService,
    private translationService: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: IBus
    ) {
      this.form = this.formBuilder.group({
        arName: ['', Validators.required],
        enName: ['', Validators.required]
      });
    }

  ngOnInit(): void {
    this.patchForm();
  }

  save(categoryForm: FormGroupDirective): void {
    if (this.form.valid) {
      if (this.data) {
        this.update();
      } else {
        this.add();
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private patchForm(): void {
    if (this.data) {
      this.form.patchValue({
        id: this.data.id,
        arName: this.data.arName,
        enName: this.data.enName
      });
    }
  }

  private add(): void {
    this.baseService.create<IBus>(Constants.RealtimeDatabase.buses, this.form.value).then(() => {
      this.close();
      this.notifyService.showNotifier(this.translationService.instant('notifications.createdSuccessfully'));
    });
  }

  private update(): void {
    this.baseService.update<IBus>(Constants.RealtimeDatabase.buses, this.data.id, this.form.value).then(() => {
      this.close();
      this.notifyService.showNotifier(this.translationService.instant('notifications.updatedSuccessfully'));
    });
  }
}
