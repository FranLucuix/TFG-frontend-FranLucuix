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
    return this.http.get<DetallePedido[]>(this.apiUrl, { withCredentials: true });
  }

  getDetallePorId(idPedido: number, idProducto: number): Observable<DetallePedido> {
    return this.http.get<DetallePedido>(`${this.apiUrl}/${idPedido}/${idProducto}`, { withCredentials: true });
  }

  crearDetalle(detalle: DetallePedido): Observable<DetallePedido> {
    return this.http.post<DetallePedido>(this.apiUrl, detalle, { withCredentials: true });
  }

  actualizarDetalle(idPedido: number, idProducto: number, detalle: DetallePedido): Observable<DetallePedido> {
    return this.http.put<DetallePedido>(`${this.apiUrl}/${idPedido}/${idProducto}`, detalle, { withCredentials: true });
  }

  borrarDetalle(idPedido: number, idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPedido}/${idProducto}`, { withCredentials: true });
  }
}
