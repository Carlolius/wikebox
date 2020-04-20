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

  constructor(private http: HttpClient) {
        console.log("HelloWorld")
  }

  getSongs() {
        console.log("Bye world");
        console.log(this.http.get('https://www.reddit.com/r/gifs/top/.json?limit=105sort=hot'));
        /* console.log(this.http.get('http://127.0.0.1:8000/api')); */
        return this.http.get('http://127.0.0.1:8000/api');
  }
}
