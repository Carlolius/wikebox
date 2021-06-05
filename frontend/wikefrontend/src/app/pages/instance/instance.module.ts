import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstancePageRoutingModule } from './instance-routing.module';

import { InstancePage } from './instance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InstancePageRoutingModule
  ],
  declarations: [InstancePage]
})
export class InstancePageModule {}
