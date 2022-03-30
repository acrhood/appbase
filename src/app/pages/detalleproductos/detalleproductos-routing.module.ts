import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleproductosPage } from './detalleproductos.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleproductosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleproductosPageRoutingModule {}
