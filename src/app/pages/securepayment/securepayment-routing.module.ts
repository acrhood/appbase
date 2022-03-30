import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurepaymentPage } from './securepayment.page';

const routes: Routes = [
  {
    path: '',
    component: SecurepaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurepaymentPageRoutingModule {}
