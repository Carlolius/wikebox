import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

	myInstance = null;
	
	constructor(
		private  authService:  AuthService,
		private  activatedRoute: ActivatedRoute,
		private  router:  Router
	) { }

	ngOnInit() {
		this.myInstance = this.activatedRoute.snapshot.paramMap.get('myInstance');
	}
	register(form) {
    this.authService.register(form.value.username, form.value.password, this.myInstance).subscribe((res)=>{
			this.router.navigateByUrl(this.myInstance + '/login');
		});
	}

}
