import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SinpePageRoutingModule } from './sinpe-routing.module';

import { SinpePage } from './sinpe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SinpePageRoutingModule
  ],
  declarations: [SinpePage]
})
export class SinpePageModule {}
