import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';

import { Storage } from '@ionic/storage-angular';
/* import { JwtHelperService } from '@auth0/angular-jwt'; */

import { HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { NavController } from '@ionic/angular';

import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
	providedIn: 'root'
})


export class AuthService {
	private _storage: Storage | null = null;

	SERVER_ADDRESS: string = 'http://192.168.1.106:8000/';
	/* loggedIn = false; // not necessary */
	token:any;
	access:any;
	refresh:any;
	data:any;
	user:any;
	session:any;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
		private router: Router,
	) {
		// Init for storage service
		this.init();
	}

	// Init for storage service
	async init() {
		const storage = await this.storage.create();
		this._storage = storage;
	}

	// Can activate
	// Test with isLoggedIn and if the token is not empty can activate
	canActivate (route: ActivatedRouteSnapshot): boolean {
		console.log("route: ", route)
		this.isLoggedIn().then((token) => {
			if (!token) {
				this.router.navigateByUrl("home");
				return false;
			}})
			return true;
		}

	getSession() {
		this.httpClient.post(this.SERVER_ADDRESS + 'users/getsession/', {"username": this.user})
		.subscribe(data => {
			const session = JSON.stringify(data)
			const unquoted = session.replace(/['"]+/g, '');
			this.session = unquoted;
			this.storeSession(unquoted)})
	}

	// Login
	login(username: String, password: String) {
		console.log("Name: "+  username)
		console.log("Password: "+ password)
		this.user = username
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/', {
			"username": username, 
			"password": password
		})
		.pipe(
			tap(token => {
				this.getSession()
				this.token = token;
				this.storeJwtToken(this.token.access)
				this.storeRefreshToken(this.token.refresh)
				this.storeUser()
				this.storeExpiration()
				this.storage.set("token", this.token)
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

	register(username: String, password: String, mySession:string) {
		console.log("Welcome: "+username)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/',	{
			username: username,
			password: password,
			userSession: mySession
		})
	}

	// Logout

	async logout() {
		this.storage.remove("token");
		/* localStorage.setItem("token", this.token); */
		/* Revocar access token */
		/* localStorage.removeItem("access"); */
		/* localStorage.removeItem("refresh"); */
		/* localStorage.removeItem("expiration"); */
		/* localStorage.removeItem("username"); */
		/* localStorage.removeItem("session"); */
		localStorage.clear()
		// this.navCtrl.navigateRoot('/home');
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

	private storeUser() {
		localStorage.setItem("username", this.user)
	}

	private storeSession(data:any) {
		localStorage.setItem("session", data)
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

}
