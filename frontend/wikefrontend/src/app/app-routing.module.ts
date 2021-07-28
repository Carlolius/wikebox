import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthService} from './services/auth.service';

const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	/* { path: '', redirectTo: 'home', pathMatch: 'full' }, */
	{
		path: 'home',
		loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
	},
	{
		path: ':myInstance/home',
		loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
			canActivate: [AuthService]
	},
	{
		path: ':myInstance/register',
		loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
	},
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
		loadChildren: () => import('./pages/callback/callback.module').then( m => m.CallbackPageModule),
			canActivate: [AuthService]
	},
	{
		path: ':myInstance/music',
		loadChildren: () => import('./pages/music/music.module').then( m => m.MusicPageModule),
			canActivate: [AuthService] /* Engadir mais Guards para comprobar que a instancia é a que é. */
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
