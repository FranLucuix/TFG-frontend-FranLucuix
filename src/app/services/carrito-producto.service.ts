import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CarritoProducto {
  idCarrito: number;
  idProducto: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoProductoService {
  private apiUrl = 'http://localhost:8080/carritoProductos';

  constructor(private http: HttpClient) {}

  getCarritoProductos(): Observable<CarritoProducto[]> {
    return this.http.get<CarritoProducto[]>(this.apiUrl, { withCredentials: true });
  }

  getCarritoProducto(idCarrito: number, idProducto: number): Observable<CarritoProducto> {
    return this.http.get<CarritoProducto>(`${this.apiUrl}/${idCarrito}/${idProducto}`, { withCredentials: true });
  }

  agregarCarritoProducto(carritoProducto: CarritoProducto): Observable<CarritoProducto> {
    return this.http.post<CarritoProducto>(this.apiUrl, carritoProducto, { withCredentials: true });
  }

  actualizarCarritoProducto(idCarrito: number, idProducto: number, carritoProducto: CarritoProducto): Observable<CarritoProducto> {
    return this.http.put<CarritoProducto>(`${this.apiUrl}/${idCarrito}/${idProducto}`, carritoProducto, { withCredentials: true });
  }

  eliminarCarritoProducto(idCarrito: number, idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idCarrito}/${idProducto}`, { withCredentials: true });
  }
}
