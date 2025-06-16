import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../../services/pedido.service';

@Component({
  standalone: true,
  selector: 'app-pedido',
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.component.html',
})
export class PedidoComponent implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;
  error: string | null = null;
  modalAbierto = false;
  modalConfirmacionAbierto = false;
  pedidoAEliminar: number | null = null;
  editando = false;

  nuevoPedido: Pedido = this.initPedido();

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pedidos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  abrirModal() {
    this.nuevoPedido = this.initPedido();
    this.editando = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.error = null;
    this.nuevoPedido = this.initPedido();
    this.editando = false;
  }

  guardarPedido() {
    if (this.nuevoPedido.fechaEntrega && this.nuevoPedido.fechaEntrega.trim() !== '') {
      this.nuevoPedido.estado = 'confirmado';
    }

    if (this.editando) {
      this.actualizarPedido();
    } else {
      this.crearPedido();
    }
  }

  onFechaEntregaChange() {
    if (this.nuevoPedido.fechaEntrega && this.nuevoPedido.fechaEntrega.trim() !== '') {
      this.nuevoPedido.estado = 'confirmado';
    } else if (this.nuevoPedido.fechaEntrega === '') {
      if (this.nuevoPedido.estado === 'confirmado') {
        this.nuevoPedido.estado = 'pendiente';
      }
    }
  }

  crearPedido() {
    this.pedidoService.crearPedido(this.nuevoPedido).subscribe({
      next: (pedidoCreado) => {
        this.pedidos.push(pedidoCreado);
        setTimeout(() => this.cerrarModal(), 300);
      },
      error: (err) => {
        this.error = 'Error al crear pedido';
        console.error(err);
      }
    });
  }

  actualizarPedido() {
    this.pedidoService.actualizarPedido(this.nuevoPedido.idPedido, this.nuevoPedido).subscribe({
      next: (pedidoActualizado) => {
        const index = this.pedidos.findIndex(p => p.idPedido === pedidoActualizado.idPedido);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
        }
        setTimeout(() => this.cerrarModal(), 300);
      },
      error: (err) => {
        this.error = 'Error al actualizar pedido';
        console.error(err);
      }
    });
  }

  editarPedido(pedido: Pedido) {
    this.nuevoPedido = { ...pedido };
    this.editando = true;
    this.modalAbierto = true;
  }

  abrirModalConfirmacion(id: number) {
    this.pedidoAEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.pedidoAEliminar = null;
  }

  confirmarBorrado() {
    if (this.pedidoAEliminar !== null) {
      this.borrarPedido(this.pedidoAEliminar);
      this.cerrarModalConfirmacion();
    }
  }

  borrarPedido(id: number) {
    this.pedidoService.borrarPedido(id).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(p => p.idPedido !== id);
      },
      error: (err) => {
        this.error = 'Error al borrar pedido';
        console.error(err);
      }
    });
  }

  private initPedido(): Pedido {
    return {
      idPedido: 0,
      idUsuario: 0,
      idPago: 0,
      fechaPedido: '',
      total: 0,
      estado: 'pendiente', 
      direccion: '',
      fechaEntrega: '',
    };
  }
}