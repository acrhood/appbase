import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddcardPage } from './addcard.page';

const routes: Routes = [
  {
    path: '',
    component: AddcardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddcardPageRoutingModule {}
