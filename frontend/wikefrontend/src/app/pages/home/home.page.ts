import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';  // Import the music service

import { AuthService } from '../../services/auth.service';
import { OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";

@Component({
	selector: 'page-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

	data = '';

	constructor(
		private authService: AuthService,
		private apiService: ApiService,
		private storage: Storage,
		private toastController: ToastController,
		private NavController: NavController,
		private router: Router
	){ }

	ngOnInit() {
		if (localStorage.getItem("instance") != null) {
			this.router.navigate([localStorage.getItem("instance") + '/home'])
		}
		// Xa comprobamos se está logueado nas rutas
		/* this.authService.isLoggedIn() */
	}

	isLoggedIn() {
		this.authService.isLoggedIn()
	}	

	logout() {
		this.authService.logout();
    this.NavController.navigateRoot('/login');
	}
	getData() {
		this.authService.getData()
	}
	
	getSpotifyToken() {
		this.apiService.spotifyLoginUrl()
	}


	clearToken() {
		// ONLY FOR TESTING!
		this.storage.remove('token');

		let toast = this.toastController.create({
			message: 'JWT removed',
			duration: 3000
		});
		toast.then(toast => toast.present());
	}

}
