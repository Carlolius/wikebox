import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';

import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';

/* D */
import { HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { NavController } from '@ionic/angular';


@Injectable({
	providedIn: 'root'
})
export class AuthService {

	SERVER_ADDRESS: string = 'http://localhost:8000/';
	loggedIn = false; // not necessary
	token:any;
	access:any;
	refresh:any;
	data:any;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
	) { }

	//// LOGIN

	login(username: String, password: String) {
		console.log("Name: "+  username)
		console.log("Password: "+ password)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/', {
			"username": username, 
			"password": password
		})
		.pipe(
			tap(token => {
				this.token = token;
				localStorage.setItem("access", this.token.access)
				localStorage.setItem("refresh", this.token.refresh)
				this.storage.set("token", this.token)
				/* localStorage.setItem("token", this.token) */
				/* this.storage.set("access", this.token.access) */
				/* this.storage.set("refresh", this.token.refresh) */
				.then(
					() => {
						//console.log('Token Stored');
					},
					error => console.error('Error storing item', error)
				);
				return token;
			}),
		);
	}

	//// REGISTER

	register(username: String, password: String) {
		console.log("HOLI: "+username)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/',	{
			username: username,
			password: password
		})
	}

	//// LOGOUT

	async logout() {
		this.storage.remove("token");
		/* localStorage.setItem("token", this.token); */
		localStorage.setItem("access", this.token.access);
		localStorage.setItem("refresh", this.token.refresh);
		this.navCtrl.navigateRoot('/home');
	}

  //// IS LOGGED IN
	
	async isLoggedIn() {
		return this.storage.get("token").then(
			data => {
				this.token = data;
				if (this.token) {
					console.log("Access: "+this.token.access)
					console.log("Refresh: "+this.token.refresh)
					return true
				}
				else {
					console.log("Not logged in")
					return false
				}
			})

	}

	//// INTERCEPTOR

  getJwtToken() {
		/* console.log(localStorage.getItem("token")) */
		return localStorage.getItem("access");
  }

  private getRefreshToken() {
    return localStorage.getItem("refresh")
  }
	
  private storeJwtToken(access: string) {
    localStorage.setItem("access", access);
  }

  refreshToken() {
    return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/refresh/', {
      'refresh': this.getRefreshToken()
    }).pipe(tap((tokens: AuthResponse) => {
      this.storeJwtToken(tokens.access);
    }));
  }

	//// Get data function for testing

	getData() {
		const headers = new HttpHeaders({
			'Authorization': "Bearer " + this.token.access
		});

		console.log(headers)
		this.httpClient.get(this.SERVER_ADDRESS + 'api/').subscribe((response)=> {
			console.log(response);
		});
	}

	//// USER not used
	user() {
		const headers = new HttpHeaders({
			'Authorization': this.token["token_type"]+" "+this.token["access_token"]
		});
		return this.httpClient.get<User>(this.SERVER_ADDRESS + 'session', { headers: headers })
		.pipe(
			tap(user => {
				return user;
			})
		)
	}
}
