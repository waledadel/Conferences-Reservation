import { NgModule } from '@angular/core';
import { NgxEditorModule } from 'ngx-editor';

import { EditorComponent } from './editor/editor.component';
import { SharedModule } from '../shared.module';

const components = [
  EditorComponent
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    SharedModule,
    NgxEditorModule
  ]
})
export class ControlsModule { }
