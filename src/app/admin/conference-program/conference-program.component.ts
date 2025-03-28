import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';

import { ConferenceProgramModel, IConferenceProgram } from './conference-program.models';
import { FireStoreService, NotifyService, TranslationService } from '@app/services';
import { Constants } from '@app/constants';
import { SharedModule } from 'app/shared/shared.module';

@Component({
  selector: 'app-conference-program',
  imports: [SharedModule],
  templateUrl: './conference-program.component.html',
  styleUrl: './conference-program.component.scss'
})
export class ConferenceProgramComponent {

  model: ConferenceProgramModel;

  private readonly formBuilder = inject(FormBuilder);
  private readonly fireStoreService = inject(FireStoreService);
  private readonly notifyService = inject(NotifyService);
  private readonly translationService = inject(TranslationService);
  private readonly angularFireStorage = inject(AngularFireStorage);

  ngOnInit(): void {
    this.initModel();
    this.initFormModel();
    this.getProgramData();
  }

  onSelectedImage(selectedFile: any): void {
    const file: File = selectedFile.files[0];
    this.uploadImage(file);
  }

  save(): void {
    if (this.model.form.valid) {
      this.model.isLoading.set(true);
      if (this.model.program().id !== '') {
        this.update();
      } else {
        this.add();
      }
    }
  }

  deleteImage(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.settings}/${this.model.program().id}`, {
      ...formValue, imageUrl: '', imageName: ''
    }).subscribe(() => {
      const storageRef = this.angularFireStorage.ref('Images/');
      storageRef.child(formValue.imageName).delete().subscribe(() => {
        this.model.selectedImage.set(Constants.Images.defaultSettingImg);
        this.notifyService.showNotifier(this.instant('notifications.savedSuccessfully'));
      });
    });
  }

  private initModel(): void {
    this.model = new ConferenceProgramModel();
  }

  private add(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.addDoc<IConferenceProgram>(Constants.RealtimeDatabase.conferenceProgram, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.instant('notifications.savedSuccessfully'));
      this.model.isLoading.set(false);
    });
  }

  private update(): void {
    const formValue = this.model.form.value;
    this.fireStoreService.updateDoc(`${Constants.RealtimeDatabase.conferenceProgram}/${this.model.program().id}`, formValue).subscribe(() => {
      this.notifyService.showNotifier(this.instant('notifications.savedSuccessfully'));
      this.model.isLoading.set(false);
    });
  }

  private initFormModel(): void {
    this.model.form = this.formBuilder.group({
      locationUrl: ['', Validators.required],
      imageUrl: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  private async uploadImage(file: File): Promise<void> {
    const filePath = `Images/${file.name}`;
    const storageRef = this.angularFireStorage.ref(filePath);
    const task = this.angularFireStorage.upload(filePath, file,  {
      cacheControl: 'max-age=2592000,public'
    });
    task.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(url => {
          if (url) {
            this.model.selectedImage.set(url);
            this.model.form.patchValue({ imageUrl: url });
          }
        });
      }),
    ).subscribe();
  }

  private getProgramData(): void {
    this.fireStoreService.getSingletonDocument<IConferenceProgram>(Constants.RealtimeDatabase.conferenceProgram).subscribe(res => {
      if (res) {
        this.patchFormValue(res);
        this.model.program.set(res);
      }
    });
  }

  private patchFormValue(item: IConferenceProgram): void {
    this.model.form.patchValue({
      locationUrl: item.locationUrl,
      imageUrl: item.imageUrl,
      message: item.message
    });
    if (item.imageUrl != '') {
      this.model.selectedImage.set(item.imageUrl);
    }
  }

  private instant(key: string): string {
    return this.translationService.instant(key);
  }
}
