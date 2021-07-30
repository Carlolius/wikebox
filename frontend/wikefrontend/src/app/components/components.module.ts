import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchresultpopComponent } from './searchresultpop/searchresultpop.component';
import { PopmenuComponent } from './popmenu/popmenu.component';
import { PopTokenComponent } from './pop-token/pop-token.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [
		SearchresultpopComponent,
		PopmenuComponent,
		PopTokenComponent,
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
