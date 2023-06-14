import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeletedMembersComponent } from './deleted-members.component';

const routes: Routes = [
  {
    path: '',
    component: DeletedMembersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeletedMembersRoutingModule { }
