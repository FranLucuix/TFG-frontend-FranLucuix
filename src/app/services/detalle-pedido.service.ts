import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetallePedido {
  idPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
}

@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
  private apiUrl = 'http://localhost:8080/detallesPedido';

  constructor(private http: HttpClient) {}

  getDetalles(): Observable<DetallePedido[]> {
    return this.http.get<DetallePedido[]>(this.apiUrl);
  }

  getDetallePorId(idPedido: number, idProducto: number): Observable<DetallePedido> {
    return this.http.get<DetallePedido>(`${this.apiUrl}/${idPedido}/${idProducto}`);
  }

  crearDetalle(detalle: DetallePedido): Observable<DetallePedido> {
    return this.http.post<DetallePedido>(this.apiUrl, detalle);
  }

  actualizarDetalle(idPedido: number, idProducto: number, detalle: DetallePedido): Observable<DetallePedido> {
    return this.http.put<DetallePedido>(`${this.apiUrl}/${idPedido}/${idProducto}`, detalle);
  }

  borrarDetalle(idPedido: number, idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPedido}/${idProducto}`);
  }
}
