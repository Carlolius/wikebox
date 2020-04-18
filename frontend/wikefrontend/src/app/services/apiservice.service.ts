/* import { Injectable } from '@angular/core'; */

/* @Injectable({ */
/*   providedIn: 'root' */
/* }) */
/* export class ApiserviceService { */

/*   constructor() { } */
/* } */



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiserviceService {

  constructor(
    private http: HttpClient
  ) {}

  getSongs() {
    return this.http.get('http://127.0.0.1:8000/api');
  }
}
