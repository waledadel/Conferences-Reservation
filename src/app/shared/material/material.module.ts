import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
// import { A11yModule } from '@angular/cdk/a11y';
// import { ScrollingModule } from '@angular/cdk/scrolling';
// import { CdkTableModule } from '@angular/cdk/table';
// import { CdkTreeModule } from '@angular/cdk/tree';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { PortalModule } from '@angular/cdk/portal';
// import { MatSliderModule } from '@angular/material/slider';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { BidiModule } from '@angular/cdk/bidi';
// import { MatTreeModule } from '@angular/material/tree';
// import { DragDropModule } from '@angular/cdk/drag-drop';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatStepperModule } from '@angular/material/stepper';
// import { MatCardModule } from '@angular/material/card';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { MatBadgeModule } from '@angular/material/badge';
// import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
// import { CdkStepperModule } from '@angular/cdk/stepper';


const modules = [
  MatButtonModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatFormFieldModule
  // MatTooltipModule,
  // MatProgressSpinnerModule,
  // ScrollingModule,
  // A11yModule,
  // CdkTableModule,
  // CdkTreeModule,
  // MatButtonToggleModule,
  // MatCheckboxModule,
  // MatProgressBarModule,
  // MatDividerModule,
  // PortalModule,
  // MatSliderModule,
  // BidiModule,
  // MatSlideToggleModule,
  // MatChipsModule,
  // MatStepperModule,
  // MatGridListModule,
  // MatTreeModule,
  // MatCardModule,
  // DragDropModule,
  // MatAutocompleteModule,
  // MatBadgeModule,
  // MatBottomSheetModule,
  // CdkStepperModule,
];
@NgModule({
  imports: [
    ...modules
  ],
  exports: [
    ...modules
  ],
})
export class MaterialModule { }
