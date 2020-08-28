import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from "rxjs/internal/Observable";
import {map} from 'rxjs/operators';
/* import { catch } from 'rxjs/operators'; */
/* import { map } from 'rxjs/operators'; */


@Injectable()

export class ApiService {

	SERVER_ADDRESS: string = 'http://localhost:8000/';

  constructor(
		private httpClient: HttpClient,
		private router: Router
	) {}
	
		get() {
			return this.httpClient.get(this.SERVER_ADDRESS);
		}

		// Gets the Spotify api login url and open it in the same window
		spotifyLoginUrl() {
			this.httpClient.get(this.SERVER_ADDRESS + 'api/token/').subscribe((response) => {
				window.open(response[0].url, '_self');
			})
		}

		// Makes a request giving the url that contains the token info
		spotifyCallback() {
			this.httpClient.post(this.SERVER_ADDRESS + 'api/callback/', {'url': window.location.href }).subscribe((response) => {
				console.log(response)
			})
		}

		// Search for songs in the spotify api
		spotifySearch(searchTerm:string): Observable<any> {
			/* return this.httpClient.post(this.SERVER_ADDRESS + 'api/search/', {'search': searchTerm}).subscribe((response) => { */
			/* 	console.log(response) */
			/* }); */
			return this.httpClient.post(this.SERVER_ADDRESS + 'api/search/', {'search': searchTerm}).pipe(
				map(results => results['Search'])
			);
		}
}

/* getSongs() { */
/*   return new Observable((observer) => { */
/*     console.log("Requesting to: " + apiUrl); */
/*     this.http.get(apiUrl)  // Make the request */
/*       //.pipe(retry(1)) // To retry the get */
/*       .subscribe(res => { */
/*         observer.next(res); */
/*         observer.complete(); */
/*         console.log(res); */
/*       }), error =>{ */
/*         observer.next(); */
/*         observer.complete(); */
/*         console.error(error); */
/*      }; */
/*   }) */
/* } */

/* export class apiserviceservice { */

/*   constructor(private http: HttpClient) { } */

/*   getSongs() { */
/*     this.http.get(apiUrl)  // Make the request */
/*       .subscribe(res => { */
/*         console.log(res); */
/*       }, err => { */
/*         console.log(err); */
/*       }); */
/*   } */

/* } */

// To pass headers if needed, in the request should add "options" after url
// From angular 5 the response is a JSON object by default

/* const options = { */
/*   headers: new HttpHeaders({ */
/*     'Content-Type': 'application/json',  // Set headers to know what kind of response we spect */
/*   }), */
/*   responseType: 'json' as const, */
/* }; */
