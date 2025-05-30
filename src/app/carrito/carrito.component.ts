import { Component, OnInit } from '@angular/core';
import { CarritoProductoService, CarritoProducto } from '../services/carrito-producto.service';
import { ProductoService, Producto } from '../services/producto.service';
import { EuroPipe } from '../shared/pipes/euro.pipe';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  idCarrito = 1;
  items: ItemCarrito[] = [];
  imagenSeleccionada: string = '';
  cargando = false;
  baseUrl = 'http://localhost:8080';


  constructor(
    private carritoProductoService: CarritoProductoService,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.cargarCarrito();
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
      alert(`Solo quedan ${item.producto.stock} unidades disponibles.`);
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
            alert(err.error);
          } else {
            alert('Ocurrió un error al actualizar la cantidad.');
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
          this.cargarCarrito();
        });
      },
      error: (err) => {
        console.error('Error al actualizar stock al eliminar', err);
        alert('No se pudo actualizar el stock del producto.');
      }
    });
  }


  vaciarCarrito(): void {
    if (confirm('¿Vaciar el carrito?')) {
      let pendientes = this.items.length;

      if (pendientes === 0) return;

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
                  this.cargarCarrito();
                }
              },
              error: (err) => {
                console.error('Error al eliminar del carrito', err);
                alert('Error al vaciar el carrito.');
              }
            });
          },
          error: (err) => {
            console.error('Error al actualizar stock', err);
            alert('No se pudo actualizar el stock de un producto.');
          }
        });
      });
    }
  }


  get total(): number {
    return this.items.reduce((suma, item) => suma + (item.producto.precioRebajado ?? item.producto.precio) * item.cantidad, 0);
  }



}
