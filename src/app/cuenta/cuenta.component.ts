import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../services/pedido.service';
import { AuthService, LoginResponse } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { EuroPipe } from '../shared/pipes/euro.pipe';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, RouterModule, EuroPipe],
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss']
})
export class CuentaComponent implements OnInit {
  usuario: LoginResponse | null = null;
  pedidos: Pedido[] = [];

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUser();

    if (!this.usuario) return;

    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos.filter(p => p.idUsuario === this.usuario?.idUsuario);
      },
      error: (err) => {
        console.error('Error al obtener pedidos', err);
      }
    });
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado?.toLowerCase().trim();
    
    switch (estadoLower) {
      case 'pendiente':
        return 'bg-primary text-white';
      case 'en preparación':
      case 'preparando':
        return 'bg-warning text-dark';
      case 'listo':
      case 'completado':
      case 'confirmado':
        return 'bg-success text-white';
      case 'cancelado':
        return 'bg-danger text-white';
      default:
        console.log('Estado no reconocido:', estado);
        return 'bg-secondary text-white';
    }
  }
}