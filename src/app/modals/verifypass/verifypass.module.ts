import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifypassPageRoutingModule } from './verifypass-routing.module';

import { VerifypassPage } from './verifypass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifypassPageRoutingModule
  ],
  declarations: [VerifypassPage]
})
export class VerifypassPageModule {}
