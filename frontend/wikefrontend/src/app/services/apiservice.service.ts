import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';

import { Observable } from "rxjs/internal/Observable";
/* import { catch } from 'rxjs/operators'; */
/* import { map } from 'rxjs/operators'; */

  var apiUrl= "http://127.0.0.1:8000/api";  

@Injectable()

export class ApiserviceService {

  constructor(private http: HttpClient) {}
	
		get() {
			return this.http.get(apiUrl);
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
