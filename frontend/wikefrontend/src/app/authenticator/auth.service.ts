import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

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

	register(user: User): Observable<AuthResponse> {
		return this.httpClient.post<AuthResponse>(`${this.SERVER_ADDRESS}/users/users/`, user).pipe(
			tap(async (res: AuthResponse ) => {
				if (res.user) {
					await this.storage.set("access_token", res.user.access_token);
					await this.storage.set("expires_in", res.user.expires_in);
					this.authSubject.next(true);
				}
			})
		);
	}

	login(user: User): Observable<AuthResponse> {
		return this.httpClient.post(`${this.SERVER_ADDRESS}/users/users/`, user).pipe(
			tap(async (res: AuthResponse) => {
				if (res.user) {
					await this.storage.set("access_token", res.user.access_token);
					await this.storage.set("expires_in", res.user.expires_in);
					this.authSubject.next(true);
				}
			})
		);
	}

	getToken() {
		return localStorage.getItem('access_token');
	}

	/* isLoggedIn() { */
	/* 	return this.authSubject.asObservable(); */
	/* } */

	get isLoggedIn(): boolean {
		let authToken = localStorage.getItem('access_token');
		return (authToken !== null) ? true : false;
	}

	/* Function to delete users, not tested yet */
	delete(id: User["id"]) {
		return this.httpClient.delete(`${this.SERVER_ADDRESS}/users/${id}`);
	}

	async logout() {
		await this.storage.remove("ACCESS_TOKEN");
		await this.storage.remove("EXPIRES_IN");
		this.authSubject.next(false);
	}

}
