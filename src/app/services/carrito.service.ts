import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Carrito {
  idCarrito: number;
  idProducto: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:8080/carritos';

  constructor(private http: HttpClient) {}

  getCarritos(): Observable<Carrito[]> {
    return this.http.get<Carrito[]>(this.apiUrl);
  }

  getCarritoPorId(idCarrito: number, idProducto: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/${idCarrito}/${idProducto}`);
  }

  agregarAlCarrito(carrito: Carrito): Observable<Carrito> {
    return this.http.post<Carrito>(this.apiUrl, carrito);
  }

  actualizarCarrito(idCarrito: number, idProducto: number, carrito: Carrito): Observable<Carrito> {
    return this.http.put<Carrito>(`${this.apiUrl}/${idCarrito}/${idProducto}`, carrito);
  }

  eliminarDelCarrito(idCarrito: number, idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idCarrito}/${idProducto}`);
  }
}
