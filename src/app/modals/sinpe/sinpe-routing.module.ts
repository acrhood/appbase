import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SinpePage } from './sinpe.page';

const routes: Routes = [
  {
    path: '',
    component: SinpePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SinpePageRoutingModule {}
