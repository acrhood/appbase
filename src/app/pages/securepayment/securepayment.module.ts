import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurepaymentPageRoutingModule } from './securepayment-routing.module';

import { SecurepaymentPage } from './securepayment.page';

import { BrMaskerModule } from 'br-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrMaskerModule,
    SecurepaymentPageRoutingModule
  ],
  declarations: [SecurepaymentPage]
})
export class SecurepaymentPageModule {}
