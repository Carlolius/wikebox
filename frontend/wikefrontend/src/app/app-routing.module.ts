import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthService} from './services/auth.service';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
			canActivate: [AuthService]
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
		path: ':myInstance/register',
		loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
	},
	/* Non testado aínda, pero supoño que debería funcionar. */
	{
		path: 'login',
		loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
	},
	{
		path: ':myInstance/login',
		loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
	},
	{
		path: 'callback',
		loadChildren: () => import('./pages/callback/callback.module').then( m => m.CallbackPageModule)
	},
	{
		path: ':myInstance/music',
		loadChildren: () => import('./pages/music/music.module').then( m => m.MusicPageModule),
			canActivate: [AuthService] /* Engadir mais Guards para comprobar que a instancia é a que é. */
	},
	{
		path: ':myInstance/admin',
		loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule),
			canActivate: [AuthService]
	},
  {
    path: 'instance',
    loadChildren: () => import('./pages/instance/instance.module').then( m => m.InstancePageModule)
  },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
