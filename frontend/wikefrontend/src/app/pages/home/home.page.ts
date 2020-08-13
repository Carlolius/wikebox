import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiserviceService } from '../../services/apiservice.service';  // Import the music service

import { AuthService } from '../../services/auth.service';
import { OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';

@Component({
	selector: 'page-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

	data = '';

	constructor(
		private authService: AuthService,
		private storage: Storage,
		private toastController: ToastController,
		private NavController: NavController
	){ }

	ngOnInit() {
		this.authService.isLoggedIn()
	}

	// Esto o cambiei, está copiado do dos usuarios

	/* isLoggedIn() { */
	/* 	this.authService.isLoggedIn(); */
	/* } */

	isLoggedIn() {
		this.authService.isLoggedIn()
	}	

	logout() {
		this.authService.logout();
    this.NavController.navigateRoot('/login');
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
