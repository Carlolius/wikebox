import { Injectable } from '@angular/core';




/* HttpClient is used to make http requests thought the api */
/*import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
 constructor(private http:HttpClient) { }
}
*/





@Injectable()
export class ApiService {

  url = 'localhost:8000/api';

  constructor(public http: HttpClient) {
    
  }

  getPosts(){
    return new Promise(resolve=>{
      this.http.get(this.url).subscribe(data=>{
          resolve(data);
      },error=>{
        console.log(error);
      });
    });
  }

}
