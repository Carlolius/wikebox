import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';

import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';

import { HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { NavController } from '@ionic/angular';

import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
	providedIn: 'root'
})


export class AuthService {

	SERVER_ADDRESS: string = 'http://localhost:8000/';
	/* loggedIn = false; // not necessary */
	token:any;
	access:any;
	refresh:any;
	data:any;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
		private router: Router,
	) { }

	// Can activate
	// Test with isLoggedIn and if the token is not empty can activate
	canActivate (route: ActivatedRouteSnapshot): boolean {
		console.log("route: ", route)
		this.isLoggedIn().then((token) => {
			if (!token) {
				this.router.navigate(["login"]);
				return false;
			}})
			return true;
		}

	// Login

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
				this.storeJwtToken(this.token.access)
				this.storeRefreshToken(this.token.refresh)
				this.storeExpiration()
				/* localStorage.setItem("access", this.token.access) */
				/* localStorage.setItem("refresh", this.token.refresh) */
				/* localStorage.setItem("expiration", JSON.stringify(Date.now() + 86400000)) */
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

	// Register

	register(username: String, password: String) {
		console.log("HOLI: "+username)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/',	{
			username: username,
			password: password
		})
	}

	// Logout

	async logout() {
		this.storage.remove("token");
		/* localStorage.setItem("token", this.token); */
		/* Revocar access token */
		localStorage.removeItem("access");
		localStorage.removeItem("refresh");
		localStorage.removeItem("expiration");
		this.navCtrl.navigateRoot('/home');
	}

	// Is logged in
	// Check if the token has expired and if not check if the token is saved
	async isLoggedIn() {
		var now = JSON.stringify(Date.now())
		var exp = localStorage.getItem("expiration");
		if (now > exp) {
			this.logout()
		} else {
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
	}

	// Interceptor

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

	private storeRefreshToken(refresh: string) {
		localStorage.setItem("refresh", refresh);
	}

	private storeExpiration() {
		localStorage.setItem("expiration", JSON.stringify(Date.now() + 86400000))
	}

	refreshToken() {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/refresh/', {
			'refresh': this.getRefreshToken()
		}).pipe(tap((tokens: AuthResponse) => {
			this.storeJwtToken(tokens.access);
			/* This is not necessary I'm not sure how it solves to update the refreshToken */
			/* this.storeRefreshToken(tokens.refresh); */
			/* this.storeExpiration(); */
		}));
	}

	// Get data function for testing

	getData() {
		const headers = new HttpHeaders({
			'Authorization': "Bearer " + this.token.access
		});

		console.log(headers)
		this.httpClient.get(this.SERVER_ADDRESS + 'api/').subscribe((response)=> {
			console.log(response);
		});
	}

	//// User not used
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
