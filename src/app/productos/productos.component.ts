import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/producto.service';
import { CarritoProductoService, CarritoProducto } from '../services/carrito-producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { EuroPipe } from '../shared/pipes/euro.pipe';

declare var bootstrap: any; 

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    RouterModule,
    EuroPipe
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  baseUrl = 'http://localhost:8080';
  categoriaSeleccionada: string = '';
  productosFiltrados: Producto[] = [];
  cargando: boolean = true;
  error: string | null = null;

  productoSeleccionado: Producto | null = null;
  cantidadSeleccionada: number = 1;
  mensajeErrorStock: string | null = null;

  private idCarrito: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoProductoService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const categoria = params.get('categoria');
      if (categoria) {
        this.categoriaSeleccionada = categoria;
        this.cargarProductos(categoria);
      }
    });
  }

  cargarProductos(categoria: string): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productosFiltrados = productos.filter(p =>
          p.categoria.toLowerCase().includes(categoria.toLowerCase())
        );
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar productos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  volverAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/catalog']);
  }

 confirmarCantidad(): void {
  if (!this.productoSeleccionado) return;

  if (this.cantidadSeleccionada > (this.productoSeleccionado.stock || 0)) {
    this.mensajeErrorStock = 'No hay suficiente stock disponible.';
    return;
  }

  this.mensajeErrorStock = null;

  const item: CarritoProducto = {
    idCarrito: this.idCarrito,
    idProducto: this.productoSeleccionado.idProducto,
    cantidad: this.cantidadSeleccionada
  };

  this.carritoService.agregarCarritoProducto(item).subscribe({
    next: () => {
      // Actualiza el stock local
      this.productoSeleccionado!.stock -= this.cantidadSeleccionada;

      // Si ya no queda stock, lo quitamos del catálogo
      if (this.productoSeleccionado!.stock <= 0) {
        this.productosFiltrados = this.productosFiltrados.filter(
          p => p.idProducto !== this.productoSeleccionado!.idProducto
        );
      }

      // Restablece cantidad
      this.cantidadSeleccionada = 1;

      // Cierra modal
      const modal = document.getElementById('productoModal');
      if (modal) {
        const bootstrapModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        bootstrapModal.hide();
      }

      alert('Producto añadido al carrito correctamente.');
    },
    error: (err: any) => {
      console.error('Error al añadir al carrito', err);
      if (err.error && typeof err.error === 'string') {
        alert(err.error);
      } else {
        alert('Error al añadir producto al carrito.');
      }
    }
  });
}

}
