import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalcardPageRoutingModule } from './modalcard-routing.module';

import { ModalcardPage } from './modalcard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalcardPageRoutingModule
  ],
  declarations: [ModalcardPage]
})
export class ModalcardPageModule {}
