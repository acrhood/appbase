import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionstatusPage } from './sessionstatus.page';

const routes: Routes = [
  {
    path: '',
    component: SessionstatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionstatusPageRoutingModule {}
