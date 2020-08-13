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

	constructor(private authService: AuthService, private storage: Storage, private toastController: ToastController, private NavController: NavController) { }

	ngOnInit() {
		console.log(this.authService.loggedIn)
	}

	// Esto o cambiei, está copiado do dos usuarios

	/* isLoggedIn() { */
	/* 	this.authService.isLoggedIn(); */
	/* } */

	isLoggedIn() {
		console.log(this.authService.loggedIn)
	}	

	logout() {
		this.authService.logout();
    this.NavController.navigateRoot('/authenticator');
	}

	getToken() {
		console.log(this.getToken())
	}

	clearToken() {
		// ONLY FOR TESTING!
		this.storage.remove('access_token');

		let toast = this.toastController.create({
			message: 'JWT removed',
			duration: 3000
		});
		toast.then(toast => toast.present());
	}

}
