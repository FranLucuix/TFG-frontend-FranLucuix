import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/producto.service';
import { CarritoProductoService, CarritoProducto } from '../services/carrito-producto.service';
import { CarritoService, Carrito } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  mensajeFlotante: string | null = null;
  tipoMensaje: 'success' | 'error' | 'warning' = 'success';
  mostrarMensaje: boolean = false;

  private idCarrito: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoProductoService: CarritoProductoService,
    private carritoService: CarritoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obtenerIdCarritoUsuario();

    this.route.paramMap.subscribe(params => {
      const categoria = params.get('categoria');
      if (categoria) {
        this.categoriaSeleccionada = categoria;
        this.cargarProductos(categoria);
      }
    });
  }

  obtenerIdCarritoUsuario(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (!usuarioJson) {
      return;
    }
    const usuario = JSON.parse(usuarioJson);
    const idUsuario = usuario.idUsuario;

    this.carritoService.getCarritoPorUsuario(idUsuario).subscribe({
      next: (carrito: Carrito) => {
        this.idCarrito = carrito.idCarrito;
      },
      error: (err) => {
        console.error('Error al obtener carrito del usuario', err);
        this.mostrarMensajeFlotante('No se pudo obtener el carrito del usuario', 'error');
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

  resetearMensajeError(): void {
    this.mensajeErrorStock = null;
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

  confirmarCantidad(): void {
    if (!this.authService.isLoggedIn()) {
      
      const modal = document.getElementById('productoModal');
      if (modal) {
        const bootstrapModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        bootstrapModal.hide();
      }
        this.router.navigate(['/login']);
      return;
    }

    if (!this.productoSeleccionado) return;

    if (this.cantidadSeleccionada > (this.productoSeleccionado.stock || 0)) {
      this.mensajeErrorStock = 'No hay suficiente stock disponible.';
      return;
    }

    if (this.idCarrito === 0) {
      this.mostrarMensajeFlotante('No se ha encontrado el carrito del usuario.', 'error');
      return;
    }

    this.mensajeErrorStock = null;

    const item: CarritoProducto = {
      idCarrito: this.idCarrito,
      idProducto: this.productoSeleccionado.idProducto,
      cantidad: this.cantidadSeleccionada
    };

    this.carritoProductoService.agregarCarritoProducto(item).subscribe({
      next: () => {
        this.productoSeleccionado!.stock -= this.cantidadSeleccionada;

        if (this.productoSeleccionado!.stock <= 0) {
          this.productosFiltrados = this.productosFiltrados.filter(
            p => p.idProducto !== this.productoSeleccionado!.idProducto
          );
        }

        this.cantidadSeleccionada = 1;

        const modal = document.getElementById('productoModal');
        if (modal) {
          const bootstrapModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          bootstrapModal.hide();
        }

        this.mostrarMensajeFlotante('Producto añadido al carrito correctamente.', 'success');
      },
      error: (err: any) => {
        console.error('Error al añadir al carrito', err);
        if (err.error && typeof err.error === 'string') {
          this.mostrarMensajeFlotante(err.error, 'error');
        } else {
          this.mostrarMensajeFlotante('Error al añadir producto al carrito.', 'error');
        }
      }
    });
  }
}