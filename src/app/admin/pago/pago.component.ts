import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService, Pago } from '../../services/pago.service';

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.component.html',
})
export class PagoComponent implements OnInit {
  pagos: Pago[] = [];
  cargando = true;
  error: string | null = null;
  modalAbierto = false;
  modalConfirmacionAbierto = false;
  pagoAEliminar: number | null = null;
  editando = false;

  nuevoPago: Pago = this.initPago();

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos() {
    this.cargando = true;
    this.pagoService.getPagos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pagos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  abrirModal() {
    this.nuevoPago = this.initPago();
    this.editando = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.error = null;
    this.nuevoPago = this.initPago();
    this.editando = false;
  }

  guardarPago() {
    if (this.editando) {
      this.actualizarPago();
    } else {
      this.crearPago();
    }
  }

  crearPago() {
    this.pagoService.crearPago(this.nuevoPago).subscribe({
      next: (pagoCreado) => {
        this.pagos.push(pagoCreado);
        setTimeout(() => this.cerrarModal(), 300);
      },
      error: (err) => {
        this.error = 'Error al crear pago';
        console.error(err);
      }
    });
  }

  actualizarPago() {
    this.pagoService.actualizarPago(this.nuevoPago.idPago, this.nuevoPago).subscribe({
      next: (pagoActualizado) => {
        const index = this.pagos.findIndex(p => p.idPago === pagoActualizado.idPago);
        if (index !== -1) {
          this.pagos[index] = pagoActualizado;
        }
        setTimeout(() => this.cerrarModal(), 300);
      },
      error: (err) => {
        this.error = 'Error al actualizar pago';
        console.error(err);
      }
    });
  }

  editarPago(pago: Pago) {
    this.nuevoPago = { ...pago };
    this.editando = true;
    this.modalAbierto = true;
  }

  abrirModalConfirmacion(id: number) {
    this.pagoAEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.pagoAEliminar = null;
  }

  confirmarBorrado() {
    if (this.pagoAEliminar !== null) {
      this.borrarPago(this.pagoAEliminar);
      this.cerrarModalConfirmacion();
    }
  }

  borrarPago(id: number) {
    this.pagoService.borrarPago(id).subscribe({
      next: () => {
        this.pagos = this.pagos.filter(p => p.idPago !== id);
      },
      error: (err) => {
        this.error = 'Error al borrar pago';
        console.error(err);
      }
    });
  }

  private initPago(): Pago {
    return {
      idPago: 0,
      tipo: '',
    };
  }
}
