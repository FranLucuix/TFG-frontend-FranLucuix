import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  idProducto: number;
  nombre: string;
  precio: number;
  precioRebajado: number;
  stock: number;
  descripcion: string;
  categoria: string;
  imagenUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/productos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl, { withCredentials: true });
  }

  getProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, { withCredentials: true });
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, { withCredentials: true });
  }

  borrarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getProductosDestacados(): Observable<Producto[]> {
  return this.http.get<Producto[]>(`${this.apiUrl}/destacados`, { withCredentials: true, responseType: 'json' });
}



}
