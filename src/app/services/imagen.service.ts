import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private apiUrl = 'http://localhost:8080/api/imagenes/subir';

  constructor(private http: HttpClient) {}

  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(this.apiUrl, formData, { 
      responseType: 'text',
      withCredentials: true  
    });
  }
}