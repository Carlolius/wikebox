import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject} from 'rxjs';
import { Router } from "@angular/router";

import { AuthResponse } from '../models/auth-response';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})

export class AuthService {

	private _storage: Storage | null = null;

	SERVER_ADDRESS = environment.SERVER_ADDRESS;
	isAuthenticated = new BehaviorSubject<boolean>(null);
	JwtHelper = new JwtHelperService();

	token:any;
	user:any;
	session:any;
	redirectUrl: string;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
		private router: Router,
		private alertController: AlertController,
	) {
		this.checkToken();  // Check if ther's a token stored
		this.initStorage(); // Initiates the storage service
	}

	// Init for storage service
	async initStorage() {
		if(this._storage != null) {
			return;
		}
		const storage = await this.storage.create();
		this._storage = storage;
	}

	// Check if the user is already logged in.
	async checkToken() {
		await this.getJwtToken().then(token => {
			if(token) {
				this.token = token
				let decoded = this.JwtHelper.decodeToken(token['access']);
				let isAccessExpired = this.JwtHelper.isTokenExpired(token['access']);
				// console.log("Accessexpired?", isAccessExpired);
				if(!isAccessExpired) {
					this.storeJwtToken(token)
					this.user = decoded['user_id'];
					this.isAuthenticated.next(true);
					if(this.redirectUrl) {
						this.router.navigate([this.redirectUrl]);
					}
				}
				else {
					this.removeToken();
					this.isAuthenticated.next(false);
				}
			}
		})
	}

	isLoggedIn(): boolean {
		console.log("isLoggedIn?", this.isAuthenticated.value);
		return this.isAuthenticated.value;
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
	
	// Alert login error
	async presentLoginError() {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: 'Login error!',
			// subHeader: 'Subtitle',
			message: 'Wrong username or password.',
			buttons: ['OK']
		});
		await alert.present();
	}

	login(username: String, password: String){
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/', {"username": username, "password": password}).pipe(
			tap(token => {
				console.log("taptoken", token);
				
				this.storeJwtToken(token)
				this.storeUser(username.toString())
				this.isAuthenticated.next(true);
			}),
			catchError(e => {
				this.presentLoginError();
				console.log("loginError", e['error']['detail']);
				throw Error(e['error']['detail']);
			})
		)
	}

	// Register
	register(username: String, password: String, mySession:string) {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/', {username: username, password: password, userSession: mySession}).pipe(
			catchError(e => {
				throw new Error(e);
			})
		)
	}

	// Logout
	logout() {
		this.removeToken();
		this.isAuthenticated.next(false);
		this.navCtrl.navigateRoot('/home');
	}

	// Interceptor
	async storeJwtToken(token):Promise<any> {
		await this.initStorage();
		this.token = token;
		return this._storage?.set("token", token);
	}

	async getJwtToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.get("token");
	}

	async removeToken():Promise<any> {
		await this.initStorage();
		return await this._storage?.clear();
	}

	private storeUser(user: string) {
		this.user = user;
		return this.storage.set("user", user)
		// localStorage.setItem("username", this.user)
	}

	private storeSession(data:any) {
		localStorage.setItem("session", data)
	}

	
	refreshToken() {
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/token/refresh/', {
			'refresh': this.token['refresh']
		}).pipe(tap((token: AuthResponse) => {
			this.storeJwtToken(token);
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
