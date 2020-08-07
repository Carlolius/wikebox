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
	loggedIn = false;
	token:any;

	constructor(
		private httpClient: HttpClient,
		private storage: Storage,
		private navCtrl: NavController,
	) { }

	//// LOGIN

	login(name: String, password: String) {
		//console.log("Name: "+  name)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/',
																{
																	"username": name, 
																	"password": password
																},
																/* { */
																/* 	headers: { */
																/* 		'Access-Control-Allow-Origin': this.SERVER_ADDRESS + 'users/users/', */
																/* 		'Content-Type': 'application/json', */
																/* 		'Accept': 'application/json' */
																/* 	} */
																/* } */
															 ).pipe(
																tap(token => {
																	this.storage.set('token', token)
																	.then(
																		() => {
																			//console.log('Token Stored');
																		},
																		error => console.error('Error storing item', error)
																	);
																	this.token = token;
																	this.loggedIn = true;
																	return token;
																}),
																);
	}

	//// REGISTER

	register(name: String, password: String) {
		//console.log("HOLI: "+fName)
		return this.httpClient.post(this.SERVER_ADDRESS + 'users/users/',
																{
																	user: {
																		username: name,
																		password: password
																	},
																},
																/* { */
																/* 	headers: { */
																/* 		'Access-Control-Allow-Origin': this.SERVER_ADDRESS + 'session', */
																/* 		'Content-Type': 'application/json', */
																/* 		'Accept': 'application/json' */
																/* 	} */
																/* } */
															 )
	}

	//// GET TOKEN

	getToken() {
		return this.storage.get('token').then(
			data => {
				this.token = data;
				if(this.token != null) {
					this.loggedIn=true;
				} else {
					this.loggedIn=false;
				}
			},
			error => {
				this.token = null;
				this.loggedIn=false;
			}
		);
	}

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
		this.navCtrl.navigateRoot('/landing');
		//this.data.resetData();
	}

	//// Error handler, MAYBE DELETE
	handleError(error: HttpErrorResponse) {
		let msg = '';
		if (error.error instanceof ErrorEvent) {
			// client-side error
			msg = error.error.message;
		} else {
			// server-side error
			msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
		}
		return throwError(msg);
	}

}
