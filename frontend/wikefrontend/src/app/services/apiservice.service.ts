/* import { Injectable } from '@angular/core'; */

/* @Injectable({ */
/*   providedIn: 'root' */
/* }) */
/* export class ApiserviceService { */

/*   constructor() { } */
/* } */



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';

import { Observable } from "rxjs";
/* import { catch } from 'rxjs/operators'; */
import { map } from 'rxjs/operators';

@Injectable()
export class ApiserviceService {

  constructor(private http: HttpClient) {
        console.log("HelloWorld")
  }
  /* data1: any; */
  /* getSongs() { */
  /*       this.getData() */
  /*         .subscribe(res => { */
  /*           console.log(res); */
  /*           this.data1 = res[0]; */
  /*         }, err => { */
  /*           console.log(err); */
  /*         }); */
  /* } */

  getRequest (): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new HttpRequest({ headers: headers });
  }

  getSongs() {
          this.http.get("http://127.0.0.1:8000/api", options)
            .subscribe(res => {
                    console.log(res);
            }, err => {
                    console.log(err);
            });
  }

  /* getData(): Observable<any> { */
  /*         let response = this.http.get('http://127.0.0.1:8000/api'); */
  /*         return(response); */
  /* } */

  getSongs2() {
        /* console.log(this.http.get('https://www.reddit.com/r/gifs/top/.json?limit=105sort=hot')); */
        console.log(this.http.get('http://127.0.0.1:8000/api'));
        /* this.http.get('http://127.0.0.1:8000/api'); */
        /* return this.http.get('http://127.0.0.1:8000/api'); */
  }
}
