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







/* import { Injectable } from  '@angular/core'; */
/* import { HttpClient } from  '@angular/common/http'; */
/* import { tap } from  'rxjs/operators'; */
/* import { Observable, BehaviorSubject } from  'rxjs'; */

/* import { Storage } from  '@ionic/storage'; */
/* import { User } from  '../models/user'; */
/* import { AuthResponse } from  '../models/auth-response'; */

/* @Injectable({ */
/* 	providedIn: 'root' */
/* }) */
/* export class AuthService { */

/* 	AUTH_SERVER_ADDRESS:  string  =  'http://localhost:8000'; */
/* 	authSubject  =  new  BehaviorSubject(false); */

/* 	constructor( */
/* 		private  httpClient:  HttpClient, */
/* 		private  storage:  Storage, */
/* 	) { } */

/* 	register(user: User): Observable<AuthResponse> { */
/* 		return this.httpClient.post<AuthResponse>(`${this.AUTH_SERVER_ADDRESS}/users/users/`, user).pipe( */
/* 			tap(async (res:  AuthResponse ) => { */
/* 				if (res.user) { */
/* 					/1* await this.storage.set("ACCESS_TOKEN", res.user.access_token); *1/ */
/* 					/1* await this.storage.set("REFRESH_TOKEN", res.user.refresh_token); *1/ */
/* 					this.authSubject.next(true); */
/* 				} */
/* 			}) */
/* 		); */
/* 	} */

/*   // Sign-in */
/*   /1* signIn(user: User) { *1/ */
/*   /1*   return this.httpClient.post<any>(`${this.AUTH_SERVER_ADDRESS}/signin`, user) *1/ */
/*   /1*     .subscribe((res: any) => { *1/ */
/*   /1*       localStorage.setItem('access_token', res.token) *1/ */
/*   /1*       this.getUserProfile(res._id).subscribe((res) => { *1/ */
/*   /1*         this.currentUser = res; *1/ */
/*   /1*         this.router.navigate(['user-profile/' + res.msg._id]); *1/ */
/*   /1*       }) *1/ */
/*   /1*     }) *1/ */
/*   /1* } *1/ */

/* 	login(user: User): Observable<AuthResponse> { */
/* 		return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/users/token/`, user).pipe( */
/* 			tap(async (res: AuthResponse) => { */
/* 				console.log(res) */
/* 				if (res.user) { */
/* 					await this.storage.set("refresh", res.user.refresh_token); */
/* 					await this.storage.set("access", res.user.access_token); */
/* 					this.authSubject.next(true); */
/* 				} */
/* 			}) */
/* 		); */
/* 	} */

/* 	async logout() { */
/* 		await this.storage.remove("ACCESS_TOKEN"); */
/* 		await this.storage.remove("EXPIRES_IN"); */
/* 		this.authSubject.next(false); */
/* 	} */

/* 	loggedIn() { */
/* 		return this.authSubject.asObservable(); */
/* 	} */

/* } */
