import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalcardPage } from './modalcard.page';

const routes: Routes = [
  {
    path: '',
    component: ModalcardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalcardPageRoutingModule {}
