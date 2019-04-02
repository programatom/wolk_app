import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(private http: HttpClient){

  }

  httpGet(url): Observable<any>{
    return this.http.get(url);
  }

  httpPost(url, params): Observable<any>{

    return this.http.post( url, JSON.stringify(params), { headers: { 'Content-Type': "application/json" } });
  }

}
