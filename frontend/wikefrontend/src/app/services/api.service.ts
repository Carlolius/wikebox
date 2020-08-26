import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from "rxjs/internal/Observable";
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

		getSpotifyUrl() {
			this.httpClient.get(this.SERVER_ADDRESS + 'api/token/').subscribe((response) => {
				window.open(response[0].url, '_self');
			})
		}

		/* spotifyCallback(response_url: string) { */
		spotifyCallback() {
			// Fai unha petición a mesma función anterior pero pasando a url que o back xa xestiona para obter o token
			console.log(this.router.url)
			return this.httpClient.post(this.SERVER_ADDRESS + 'api/callback/', {'responseUrl': this.router.url})
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
