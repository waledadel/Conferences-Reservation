import { NgModule } from '@angular/core';

import { AdvancedSearchComponent } from './advanced-search.component';
import { SharedModule } from 'app/shared/shared.module';



@NgModule({
  declarations: [
    AdvancedSearchComponent
  ],
  exports: [
    AdvancedSearchComponent
  ],
  imports: [
    SharedModule
  ]
})
export class AdvancedSearchModule { }
