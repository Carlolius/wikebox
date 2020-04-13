import { Injectable } from '@angular/core';

/* HttpClient is used to make http requests thought the api */
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
 constructor(private http:HttpClient) { }
}
