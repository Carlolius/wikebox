import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
	/* Por aquí hay que arreglar algo con el authenticator y el authentication #lidiña */
  /* { path: 'authenticator', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)}, */
  /* { */
  /*   path: 'authenticator', */
  /*   loadChildren: () => import('./auth/authentication/authentication.module').then( m => m.AuthenticationPageModule) */
  /* }, */
  {
    path: 'authentication',
    loadChildren: () => import('./auth/authentication/authentication.module').then( m => m.AuthenticationPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
