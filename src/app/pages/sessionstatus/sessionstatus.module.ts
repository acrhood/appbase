import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SessionstatusPageRoutingModule } from './sessionstatus-routing.module';

import { SessionstatusPage } from './sessionstatus.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SessionstatusPageRoutingModule
  ],
  declarations: [SessionstatusPage]
})
export class SessionstatusPageModule {}
