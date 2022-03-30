import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdddirectionPage } from './adddirection.page';

const routes: Routes = [
  {
    path: '',
    component: AdddirectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdddirectionPageRoutingModule {}
