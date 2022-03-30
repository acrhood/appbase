import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfouserPageRoutingModule } from './infouser-routing.module';

import { InfouserPage } from './infouser.page';

import { BrMaskerModule } from 'br-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfouserPageRoutingModule,
    BrMaskerModule
  ],
  declarations: [InfouserPage]
})
export class InfouserPageModule {}
