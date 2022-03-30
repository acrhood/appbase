import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleproductosPageRoutingModule } from './detalleproductos-routing.module';

import { DetalleproductosPage } from './detalleproductos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleproductosPageRoutingModule
  ],
  declarations: [DetalleproductosPage]
})
export class DetalleproductosPageModule {}
