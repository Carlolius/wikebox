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
import { NavController } from '@ionic/angular';
/* import {DataService} from "./data.service" // not sure yet */

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	SERVER_ADDRESS: string = 'http://localhost:8000/';
	loggedIn = false; // not necessary
	token:any;
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
				console.log(token)
				this.storage.set("token", token)
				.then(
					() => {
						//console.log('Token Stored');
					},
					error => console.error('Error storing item', error)
				);
				this.token = token;
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

	//// Get data for testing

	getData() {
		const headers = new HttpHeaders({
			'Authorization': "Bearer " + this.token.access
		});

		console.log(headers)
		this.httpClient.get(this.SERVER_ADDRESS + 'api/', {headers: headers}).subscribe((response)=> {
			console.log(response);
		});
	}

	//// GET TOKEN

	/* getToken() { */
	/* 	return this.storage.get("token").then( */
	/* 		data => { */
	/* 			this.token = data; */
	/* 			if(this.token != null) { */
	/* 				this.loggedIn=true; */
	/* 			} else { */
	/* 				this.loggedIn=false; */
	/* 			} */
	/* 		}, */
	/* 		error => { */
	/* 			this.token = null; */
	/* 			this.loggedIn=false; */
	/* 		} */
	/* 	); */
	/* } */

	//// USER
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

	//// LOGOUT

	async logout() {
		this.storage.remove("token");
		this.navCtrl.navigateRoot('/home');
	}

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
}
