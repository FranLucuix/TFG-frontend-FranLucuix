import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Carrito {
  idCarrito: number;
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:8080/carritos';

  constructor(private http: HttpClient) { }

  getCarritos(): Observable<Carrito[]> {
    return this.http.get<Carrito[]>(this.apiUrl, { withCredentials: true });
  }

  borrarCarrito(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCarritoPorUsuario(idUsuario: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/usuario/${idUsuario}`, { withCredentials: true });
  }

  getCarritoPorId(idCarrito: number, idProducto: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/${idCarrito}/${idProducto}`, { withCredentials: true });
  }

  agregarAlCarrito(carrito: Carrito): Observable<Carrito> {
    return this.http.post<Carrito>(this.apiUrl, carrito, { withCredentials: true });
  }

  actualizarCarrito(idCarrito: number, idProducto: number, carrito: Carrito): Observable<Carrito> {
    return this.http.put<Carrito>(`${this.apiUrl}/${idCarrito}/${idProducto}`, carrito, { withCredentials: true });
  }

  eliminarDelCarrito(idCarrito: number, idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idCarrito}/${idProducto}`, { withCredentials: true });
  }
}
