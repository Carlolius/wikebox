import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../auth.service';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
	selector: 'app-authentication',
	templateUrl: './authentication.page.html',
	styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {

	credentialsForm: FormGroup;

	constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

	ngOnInit() {
		this.credentialsForm = this.formBuilder.group({
			username: ['', [Validators.required, Validators.requiredTrue]],
			password: ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	onSubmit() {
    this.authService.login(this.credentialsForm.value).subscribe();
  }

  register() {
    this.authService.register(this.credentialsForm.value).subscribe(res => {
      // Call Login to automatically login the new user
      this.authService.login(this.credentialsForm.value).subscribe();
    });
  }

}
