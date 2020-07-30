import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';

import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';

const TOKEN_KEY = 'access_token';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	SERVER_ADDRESS: string = 'http://localhost:8000';
	authState = new BehaviorSubject(false);
	user = null;

	constructor(private httpClient: HttpClient, private helper: JwtHelperService, private storage: Storage, private plt: Platform) {
		this.plt.ready().then(() => {
			this.checkToken();
		});
	}

	//// CHECK TOKEN

  checkToken() {
    this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        let isExpired = this.helper.isTokenExpired(token);
 
        if (!isExpired) {
          this.authState.next(true);
        } else {
          this.storage.remove(TOKEN_KEY);
        }
      }
    });
  }

	//// REGISTER

  register(credentials) {
    return this.httpClient.post(`${this.SERVER_ADDRESS}/api/register`, credentials).pipe(
      catchError(e => {
        console.log(e.error.msg);
        throw new Error(e);
      })
    );
  }

	register3(user) {
		let api = `${this.SERVER_ADDRESS}/users/users`;
		return this.httpClient.post(api, user)
		.pipe(
			catchError(this.handleError)
		)
	}

	//// LOGIN

  login(credentials) {
    return this.httpClient.post(`${this.SERVER_ADDRESS}/api/login`, credentials)
      .pipe(
        tap(res => {
          this.storage.set(TOKEN_KEY, res['token']);
          this.user = this.helper.decodeToken(res['token']);
          this.authState.next(true);
        }),
        catchError(e => {
          console.log(e.error.msg);
          throw new Error(e);
        })
      );
  }

	//// GET TOKEN

	getToken() {
		return localStorage.getItem('access_token');
	}

	//// IS AUTHENTICATED

	isAuthenticated() {
		return this.authState.value;
	}

	//// IS LOGGED IN

	isLoggedIn() {
		return this.authState.asObservable();
	}

	get isLoggedIn3(): boolean {
		let authToken = localStorage.getItem('access_token');
		return (authToken !== null) ? true : false;
	}

	//// LOGOUT

	 logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.authState.next(false);
    });
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
