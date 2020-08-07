import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../auth.service';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/* D */
import { ModalController, NavController } from '@ionic/angular';
/* import { AlertService } from 'src/app/services/alert.service'; */
import { NgForm } from '@angular/forms';

@Component({
	selector: 'app-authentication',
	templateUrl: './authentication.page.html',
	styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private router: Router,

		private modalController: ModalController,
		private navCtrl: NavController,
		/* private alertService: AlertService, */
	) { }

	ngOnInit() {
	}
	// Dismiss Login Modal
	dismissLogin() {
		this.modalController.dismiss();
	}

	// Dismiss Register Modal
	dismissRegister() {
		this.modalController.dismiss();
	}

	// On Register button tap, dismiss login modal and open register modal
	registerModal() {
		this.navCtrl.navigateRoot('/register');
	}

	login(form: NgForm) {
		this.authService.login(form.value.name, form.value.password).subscribe(
			data => {
				//this.alertService.presentToast("Logged In");
			},
			error => {
				//console.log(error);
			},
			() => {
				/* this.dismissLogin(); */
				this.navCtrl.navigateRoot('/home');
			}
		);
	}

	register(form: NgForm) {
		this.authService.register(form.value.name, form.value.password).subscribe(
			data => {
				this.authService.login(form.value.name, form.value.password).subscribe(
					data => {
					},
					error => {
						//console.log(error);
					},
					() => {
						/* this.dismissRegister(); */
						this.navCtrl.navigateRoot('/home');
					}
				);
				//this.alertService.presentToast(data['message']);
			},
			error => {
				//console.log(error);
			},
			() => {

			}
		);
	}

	/* register() { */
	/*   this.authService.register(this.credentialsForm.value).subscribe(res => { */
	/*     // Call Login to automatically login the new user */
	/*     this.authService.login(this.credentialsForm.value).subscribe(); */
	/*   }); */
	/* } */

}
