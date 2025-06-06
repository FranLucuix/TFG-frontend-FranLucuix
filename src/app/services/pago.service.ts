import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pago {
  idPago: number;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = 'http://localhost:8080/pagos';

  constructor(private http: HttpClient) {}

  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl, { withCredentials: true });
  }

  getPagoPorId(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  crearPago(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago, { withCredentials: true });
  }

  actualizarPago(id: number, pago: Pago): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago, { withCredentials: true });
  }

  borrarPago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
