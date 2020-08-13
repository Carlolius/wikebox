/* import { Component, OnInit } from '@angular/core'; */
/* import { ModalController, NavController } from '@ionic/angular'; */
/* import { LoginPage } from '../login/login.page'; */
/* import { AuthService } from 'src/app/services/auth.service'; */
/* import { NgForm } from '@angular/forms'; */
/* /1* import { AlertService } from 'src/app/services/alert.service'; *1/ */
/* @Component({ */
/*   selector: 'app-register', */
/*   templateUrl: './register.page.html', */
/*   styleUrls: ['./register.page.scss'], */
/* }) */
/* export class RegisterPage implements OnInit { */
/*   constructor(private modalController: ModalController, */
/*     private authService: AuthService, */
/*     private navCtrl: NavController, */
/*     /1* private alertService: AlertService *1/ */
/*   ) { } */
/*   ngOnInit() { */
/*   } */
/*   // Dismiss Register Modal */
/*   dismissRegister() { */
/*     this.modalController.dismiss(); */
/*   } */
/*   // On Login button tap, dismiss Register modal and open login Modal */
/*   async loginModal() { */
/*     this.navCtrl.navigateRoot('/login'); */
/*   } */
/*   register(form: NgForm) { */
/*     this.authService.register(form.value.name, form.value.password).subscribe( */
/*       data => { */
/*         this.authService.login(form.value.email, form.value.password).subscribe( */
/*           data => { */
/*           }, */
/*           error => { */
/*             //console.log(error); */
/*           }, */
/*           () => { */
/*             this.dismissRegister(); */
/*             this.navCtrl.navigateRoot('/landing'); */
/*           } */
/*         ); */
/*         //this.alertService.presentToast(data['message']); */
/*       }, */
/*       error => { */
/*         //console.log(error); */
/*       }, */
/*       () => { */
        
/*       } */
/*     ); */
/*   } */

/* } */





import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

	constructor(
		private  authService:  AuthService,
		private  router:  Router
	) { }

	ngOnInit() {
	}
	register(form) {
		/* this.authService.register(form.value).subscribe((res) => { */
    this.authService.register(form.value.username, form.value.password).subscribe((res)=>{
			this.router.navigateByUrl('home');
		});
	}

}
