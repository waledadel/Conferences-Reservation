import { Component, OnDestroy } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';

// import jsonDoc from './doc';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnDestroy {

  editor: Editor;
  html: string;
  toolbar: Toolbar;
  // editordoc = jsonDoc;

  constructor() {
    this.editor = new Editor();
    this.html = '';
    this.toolbar = [];
  }

  ngOnInit(): void {
    this.toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}
