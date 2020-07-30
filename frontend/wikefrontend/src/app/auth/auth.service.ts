import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';

import { Storage } from '@ionic/storage';
import { User } from './user';
import { AuthResponse } from './auth-response';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	SERVER_ADDRESS: string = 'http://localhost:8000';
	authSubject = new BehaviorSubject(false);

	constructor(private httpClient: HttpClient, private storage: Storage) { }

	//// REGISTER

	register(user: User): Observable<AuthResponse> {
		return this.httpClient.post<AuthResponse>(`${this.SERVER_ADDRESS}/users/users/`, user).pipe(
			tap(async (res: AuthResponse ) => {

				if (res.user) {
					await this.storage.set("access_token", res.user.access_token);
					await this.storage.set("refresh_token", res.user.refresh_token);
					this.authSubject.next(true);
				}
			}),
			catchError(this.handleError)
		);
	}

	register3(user: User): Observable<any> {
		let api = `${this.SERVER_ADDRESS}/users/users`;
		return this.httpClient.post(api, user)
		.pipe(
			catchError(this.handleError)
		)
	}

	//// LOGIN

	login(user: User): Observable<AuthResponse> {
		return this.httpClient.post(`${this.SERVER_ADDRESS}/users/token/`, user).pipe( 						// When this post occurs you get back the token is the log in
			tap(async (res: AuthResponse) => {
				console.log(res)
				if (res) {
					await this.storage.set('access', res.user.access_token);
					await this.storage.set('refresh', res.user.refresh_token);
					this.authSubject.next(true);
					console.log("Por allá")
				}
			}),
			catchError(this.handleError)
		);
	}

	//// GET TOKEN

	getToken() {
		return localStorage.getItem('access_token');
	}

	//// IS LOGGED IN

	isLoggedIn1() {
		return this.authSubject.asObservable();
	}

	get isLoggedIn(): boolean {
		let authToken = localStorage.getItem('access_token');
		return (authToken !== null) ? true : false;
	}

	//// LOGOUT

	async logout() {
		await this.storage.remove('access_token');
		await this.storage.remove('refresh_token');
		this.authSubject.next(false);
	}

	/* Function to delete users, not tested yet */
	delete(id: User["id"]) {
		return this.httpClient.delete(`${this.SERVER_ADDRESS}/users/${id}`);
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

	//// Check if token is expired
	/* checkToken() { */
	/* 	let isExpired = this.helper.isTokenExpired(token); */

	/* 	if (!isExpired) { */
	/* 		this.authenticationState.next(true); */
	/* 	} else { */
	/* 		this.storage.remove(TOKEN_KEY); */
	/* 	} */
	/* } */

}
