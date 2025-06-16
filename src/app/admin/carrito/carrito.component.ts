import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService, Carrito } from '../../services/carrito.service';
import { CarritoProductoService, CarritoProducto } from '../../services/carrito-producto.service';
import { ProductoService, Producto } from '../../services/producto.service';
import { EuroPipe } from '../../shared/pipes/euro.pipe';

@Component({
  standalone: true,
  selector: 'app-admin-carrito',
  imports: [CommonModule, EuroPipe],
  templateUrl: './carrito.component.html'
})
export class CarritoComponent implements OnInit {
  carritos: Carrito[] = [];
  totales: { [idCarrito: number]: number } = {};
  cargando = true;
  error: string | null = null;

  modalConfirmacionAbierto = false;
  carritoAEliminar: number | null = null;

  constructor(
    private carritoService: CarritoService,
    private carritoProductoService: CarritoProductoService,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.cargarCarritos();
  }

  cargarCarritos() {
    this.cargando = true;
    this.carritoService.getCarritos().subscribe({
      next: (carritos) => {
        this.carritos = carritos;
        this.cargarTotales();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar carritos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarTotales() {
    this.carritoProductoService.getCarritoProductos().subscribe({
      next: (carritoProductos) => {
        const promesas = this.carritos.map(async carrito => {
          const productosDeCarrito = carritoProductos.filter(cp => cp.idCarrito === carrito.idCarrito);

          let total = 0;

          for (const cp of productosDeCarrito) {
            try {
              const producto = await this.productoService.getProductoPorId(cp.idProducto).toPromise();

              if (producto) {
                const precio = (producto.precioRebajado && producto.precioRebajado > 0)
                  ? producto.precioRebajado
                  : producto.precio;

                total += precio * cp.cantidad;
              }
            } catch (err) {
              console.error(`Error al obtener producto con ID ${cp.idProducto}`, err);
            }
          }


          this.totales[carrito.idCarrito] = total;
        });

        Promise.all(promesas).then(() => {
        });
      },
      error: (err) => {
        this.error = 'Error al cargar productos del carrito';
        console.error(err);
      }
    });
  }

  abrirModalConfirmacion(id: number) {
    this.carritoAEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.carritoAEliminar = null;
  }

  confirmarBorrado() {
    if (this.carritoAEliminar !== null) {
      this.carritoService.borrarCarrito(this.carritoAEliminar).subscribe({
        next: () => {
          this.carritos = this.carritos.filter(c => c.idCarrito !== this.carritoAEliminar);
          if (this.carritoAEliminar !== null) {
            delete this.totales[this.carritoAEliminar];
          }
          this.cerrarModalConfirmacion();
        },
        error: (err) => {
          this.error = 'Error al borrar carrito';
          console.error(err);
        }
      });
    }
  }


  obtenerTotal(idCarrito: number): number {
    return this.totales[idCarrito] ?? 0;
  }
}
