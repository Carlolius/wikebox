/* import { Component, OnInit } from '@angular/core'; */
/* import { ModalController, NavController } from '@ionic/angular'; */
/* import { RegisterPage } from '../register/register.page'; */
/* import { NgForm } from '@angular/forms'; */
/* import { AuthService } from 'src/app/services/auth.service'; */
/* /1* import { AlertService } from 'src/app/services/alert.service'; *1/ */
/* @Component({ */
/*   selector: 'app-login', */
/*   templateUrl: './login.page.html', */
/*   styleUrls: ['./login.page.scss'], */
/* }) */
/* export class LoginPage implements OnInit { */
  
/*   constructor( */
/*     private modalController: ModalController, */
/*     private authService: AuthService, */
/*     private navCtrl: NavController, */
/*     /1* private alertService: AlertService *1/ */
/*   ) { } */
/*   ngOnInit() { */
/*   } */
/*   // Dismiss Login Modal */
/*   dismissLogin() { */
/*     this.modalController.dismiss(); */
/*   } */
/*   // On Register button tap, dismiss login modal and open register modal */
/*   registerModal() { */
/*     this.navCtrl.navigateRoot('/register'); */
/*   } */
/*   login(form: NgForm) { */
/*     this.authService.login(form.value.name, form.value.password).subscribe( */
/*       data => { */
/*         //this.alertService.presentToast("Logged In"); */
/*       }, */
/*       error => { */
/*         //console.log(error); */
/*       }, */
/*       () => { */
/*         this.dismissLogin(); */
/*         this.navCtrl.navigateRoot('/dashboard'); */
/*       } */
/*     ); */
/*   } */

/* } */





import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
		private  authService:  AuthService,
		private  router:  Router
	) { }

  ngOnInit() {
  }

  login(form){
    /* this.authService.login(form.value).subscribe((res)=>{ */
    this.authService.login(form.value.username, form.value.password).subscribe((res)=>{
      /* this.router.navigateByUrl('home'); */
    });
  }
}
