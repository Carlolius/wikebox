import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
	/* Por aquí hay que arreglar algo con el authenticator y el authentication #lidiña */
  /* { path: 'authenticator', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)}, */
  /* { */
  /*   path: 'authenticator', */
  /*   loadChildren: () => import('./auth/authentication/authentication.module').then( m => m.AuthenticationPageModule) */
  /* }, */
  {
    path: 'authentication',
    loadChildren: () => import('./pages/authentication/authentication.module').then( m => m.AuthenticationPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'callback',
    loadChildren: () => import('./pages/callback/callback.module').then( m => m.CallbackPageModule)
  },
  {
    path: 'music',
    loadChildren: () => import('./pages/music/music.module').then( m => m.MusicPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
