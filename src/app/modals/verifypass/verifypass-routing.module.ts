import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifypassPage } from './verifypass.page';

const routes: Routes = [
  {
    path: '',
    component: VerifypassPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifypassPageRoutingModule {}
