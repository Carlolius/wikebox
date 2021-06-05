import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstancePage } from './instance.page';

const routes: Routes = [
  {
    path: '',
    component: InstancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstancePageRoutingModule {}
