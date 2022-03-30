import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const URL = environment.url;

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor( private http: HttpClient ) { }

  crud( data: any ) {
    return this.http.get(`${ URL }conf_app/ctr_app.php?arreglo=` + JSON.stringify( data ));
  }

}
