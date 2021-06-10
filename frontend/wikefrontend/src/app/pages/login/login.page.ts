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
		/* console.log(this.myInstance) */
		/* if (this.myInstance != null) { */
		/* 	this.router.navigate([this.myInstance + '/home']) */
		/* } */
	}
	login(form){
		this.authService.login(form.value.username, form.value.password).subscribe((res)=>{
			// A redirección do router debería de ser a instancia do propio usuario
			if (this.myInstance != null)
				this.router.navigate([localStorage.getItem("instance") + '/home'])
			else
				this.router.navigateByUrl('home')
		});
	}
	newuser(){
		if (this.myInstance != null) {
			this.router.navigate([this.myInstance + '/register'])
		} else {
			this.router.navigateByUrl("instance")
		}
	}
}
