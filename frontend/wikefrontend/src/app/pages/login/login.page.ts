import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

	mySession = null;

	constructor(
		private  authService:  AuthService,
		private  activatedRoute: ActivatedRoute,
		private  router:  Router
	) { }

	ngOnInit() {
		this.mySession = this.activatedRoute.snapshot.paramMap.get('mySession');
		/* console.log(this.mySession) */
		/* if (this.mySession != null) { */
		/* 	this.router.navigate([this.mySession + '/home']) */
		/* } */
	}
	login(form){
		this.authService.login(form.value.username, form.value.password).subscribe((res)=>{
			// A redirección do router debería de ser a instancia do propio usuario
			if (this.mySession != null){
				this.router.navigate([this.mySession + '/home'])
			}
			else
				this.router.navigateByUrl('home')
		});
	}
	// Esta función non parece que faga ben as redireccións.
	newuser(){
		if (this.mySession != null) {
			this.router.navigate([this.mySession + '/register'])
		} else {
			this.router.navigateByUrl("session")
		}
	}
}
