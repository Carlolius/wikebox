import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchresultpopComponent } from './searchresultpop/searchresultpop.component';
import { PopmenuComponent } from './popmenu/popmenu.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [
		SearchresultpopComponent,
		PopmenuComponent,
	],
	exports: [
		SearchresultpopComponent,
	],
  imports: [
    CommonModule,
		IonicModule,
  ]
})
export class ComponentsModule { }
