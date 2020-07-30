import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-authentication',
	templateUrl: './authentication.page.html',
	styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
		console.log(this.authService.isLoggedIn)
	}

	register(form) {
		this.authService.register(form.value).subscribe((res) => {
			this.router.navigateByUrl('home');
		});
	}

	login(form) {
		this.authService.login(form.value).subscribe((res) => {
			this.router.navigateByUrl('home');
		});
	}

}
