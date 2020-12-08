import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
	entryComponents: [
		SearchresultpopComponent,
	],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
		ComponentsModule,
  ],
  declarations: [AdminPage]
})
export class AdminPageModule {}
