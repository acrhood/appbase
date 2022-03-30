import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuPageRoutingModule } from './menu-routing.module';
import { MenuPage } from './menu.page';

import { ComponentsModule } from '../../components/components.module';
import { FilterComponent } from '../../components/filter/filter.component';

@NgModule({
  entryComponents: [ FilterComponent ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
