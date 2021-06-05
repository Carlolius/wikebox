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

	myInstance = null;

	constructor(
		private  authService:  AuthService,
		private  activatedRoute: ActivatedRoute,
		private  router:  Router
	) { }

	ngOnInit() {
		this.myInstance = this.activatedRoute.snapshot.paramMap.get('myInstance');
	}
	login(form){
		this.authService.login(form.value.username, form.value.password).subscribe((res)=>{
			// A redirección do router debería de ser a instancia do propio usuario
			this.router.navigateByUrl('home');
		});
	}
	newuser(){
		this.router.navigateByUrl(this.myInstance + '/register')
	}
}
