import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';

import { Observable } from "rxjs";
/* import { catch } from 'rxjs/operators'; */
/* import { map } from 'rxjs/operators'; */

var apiUrl = "http://127.0.0.1:8000/api";  

@Injectable()
export class ApiserviceService {

  constructor(private http: HttpClient) {
  }

  getSongs() {
    const options = {
      headers: new HttpHeaders({
	'Content-Type': 'application/json',  // Set headers to know what kind of response we spect
      }),
      /* responseType: 'json' as const, */
    };
    this.http.get(apiUrl, options)  // Make the request
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
}
