import { Component, OnInit } from '@angular/core';
import { CarritoProductoService } from '../services/carrito-producto.service';
import { ProductoService, Producto } from '../services/producto.service';
import { CarritoService, Carrito } from '../services/carrito.service';
import { EuroPipe } from '../shared/pipes/euro.pipe';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

declare var bootstrap: any;

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [EuroPipe, CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  idCarrito: number = 0;
  items: ItemCarrito[] = [];
  imagenSeleccionada: string = '';
  cargando = false;
  baseUrl = 'http://localhost:8080';

  mensajeFlotante: string | null = null;
  tipoMensaje: 'success' | 'error' | 'warning' = 'success';
  mostrarMensaje: boolean = false;
  modalConfirmacionVisible: boolean = false;

  constructor(
    private carritoProductoService: CarritoProductoService,
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (!usuarioJson) {
      this.mostrarMensajeFlotante('Debe iniciar sesión.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const usuario = JSON.parse(usuarioJson);
    if (!usuario || !usuario.idUsuario) {
      this.mostrarMensajeFlotante('Usuario inválido. Debe iniciar sesión nuevamente.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const idUsuario = usuario.idUsuario;

    this.carritoService.getCarritoPorUsuario(idUsuario).subscribe({
      next: (carrito) => {
        this.idCarrito = carrito.idCarrito;
        this.cargarCarrito();
      },
      error: (err) => {
        console.error('Error al obtener carrito del usuario', err);
        if (err.status === 403) {
          this.mostrarMensajeFlotante('Sesión expirada. Inicie sesión nuevamente.', 'error');
          this.router.navigate(['/login']);
        } else {
          this.mostrarMensajeFlotante('No se pudo obtener el carrito.', 'error');
        }
      }
    });
  }

  cargarCarrito(): void {
    this.cargando = true;
    this.items = [];

    this.carritoProductoService.getCarritoProductos().subscribe(productosCarrito => {
      const productosFiltrados = productosCarrito.filter(p => p.idCarrito === this.idCarrito);

      const peticiones = productosFiltrados.map(cp =>
        this.productoService.getProductoPorId(cp.idProducto).toPromise()
          .then(producto => {
            if (!producto) return null;
            return { producto, cantidad: cp.cantidad };
          })
          .catch(() => null)
      );

      Promise.all(peticiones).then((resultados: (ItemCarrito | null)[]) => {
        this.items = resultados.filter((item): item is ItemCarrito => item !== null);
        this.cargando = false;
      });
    });
  }

  abrirModal(imagenUrl: string): void {
    this.imagenSeleccionada = this.baseUrl + imagenUrl;
    const modalElement = document.getElementById('imagenModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  actualizarCantidad(item: ItemCarrito, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevaCantidad = Number(input.value);
    const cantidad = Math.max(1, nuevaCantidad);

    const diferencia = cantidad - item.cantidad;

    if (diferencia > 0 && diferencia > item.producto.stock) {
      this.mostrarMensajeFlotante(`Solo quedan ${item.producto.stock} unidades disponibles.`, 'warning');
      input.value = String(item.cantidad);
      return;
    }

    const dto = {
      idCarrito: this.idCarrito,
      idProducto: item.producto.idProducto,
      cantidad
    };

    this.carritoProductoService
      .actualizarCarritoProducto(dto.idCarrito, dto.idProducto, dto)
      .subscribe({
        next: () => this.cargarCarrito(),
        error: (err) => {
          console.error('Error al actualizar cantidad', err);

          if (err.error && typeof err.error === 'string') {
            this.mostrarMensajeFlotante(err.error, 'error');
          } else {
            this.mostrarMensajeFlotante('Ocurrió un error al actualizar la cantidad.', 'error');
          }

          input.value = String(item.cantidad);
        }
      });
  }

  eliminarItem(item: ItemCarrito): void {
    const nuevoStock = item.producto.stock + item.cantidad;
    const productoActualizado = {
      ...item.producto,
      stock: nuevoStock
    };

    this.productoService.actualizarProducto(item.producto.idProducto, productoActualizado).subscribe({
      next: () => {
        this.carritoProductoService.eliminarCarritoProducto(this.idCarrito, item.producto.idProducto).subscribe(() => {
          this.mostrarMensajeFlotante('Producto eliminado del carrito.', 'success');
          this.cargarCarrito();
        });
      },
      error: (err) => {
        console.error('Error al actualizar stock al eliminar', err);
        this.mostrarMensajeFlotante('No se pudo actualizar el stock del producto.', 'error');
      }
    });
  }

  

  get total(): number {
  return this.items.reduce((suma, item) => {
    const precio = item.producto.precioRebajado > 0 ? item.producto.precioRebajado : item.producto.precio;
    return suma + precio * item.cantidad;
  }, 0);
}


  realizarPedido(): void {
    this.router.navigate(['/pedido']);
  }

  mostrarMensajeFlotante(mensaje: string, tipo: 'success' | 'error' | 'warning'): void {
    this.mensajeFlotante = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarMensaje = true;

    setTimeout(() => {
      this.ocultarMensajeFlotante();
    }, 4000);
  }

  ocultarMensajeFlotante(): void {
    this.mostrarMensaje = false;
    setTimeout(() => {
      this.mensajeFlotante = null;
    }, 300);
  }
  
  confirmarVaciarCarrito(): void {
  this.modalConfirmacionVisible = true;
}

cancelarVaciarCarrito(): void {
  this.modalConfirmacionVisible = false;
}

confirmarVaciarCarritoDesdeModal(): void {
  this.modalConfirmacionVisible = false;

  let pendientes = this.items.length;
  if (pendientes === 0) {
    this.mostrarMensajeFlotante('El carrito ya está vacío.', 'warning');
    return;
  }

  this.items.forEach(item => {
    const nuevoStock = item.producto.stock + item.cantidad;
    const productoActualizado = {
      ...item.producto,
      stock: nuevoStock
    };

    this.productoService.actualizarProducto(item.producto.idProducto, productoActualizado).subscribe({
      next: () => {
        this.carritoProductoService.eliminarCarritoProducto(this.idCarrito, item.producto.idProducto).subscribe({
          next: () => {
            pendientes--;
            if (pendientes === 0) {
              this.mostrarMensajeFlotante('Carrito vaciado correctamente.', 'success');
              this.cargarCarrito();
            }
          },
          error: () => {
            this.mostrarMensajeFlotante('Error al vaciar el carrito.', 'error');
          }
        });
      },
      error: () => {
        this.mostrarMensajeFlotante('No se pudo actualizar el stock de un producto.', 'error');
      }
    });
  });
}
}