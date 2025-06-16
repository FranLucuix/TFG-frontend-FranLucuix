import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnInit, HostListener } from '@angular/core';
import * as L from 'leaflet';
import { ProductoService, Producto } from '../services/producto.service';
import { EuroPipe } from '../shared/pipes/euro.pipe';
import { FormsModule } from '@angular/forms';
import { CarritoProductoService } from '../services/carrito-producto.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

declare var bootstrap: any;

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/img/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/img/leaflet/marker-icon.png',
  shadowUrl: 'assets/img/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, EuroPipe, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {
  selectedStore: any = null;
  productosDestacados: Producto[] = [];
  gruposProductos: Producto[][] = [];
  productoSeleccionado: any = null;
  cantidadSeleccionada: number = 1;
  mensajeError: string = '';
  mostrarMensaje: boolean = false;
  mensaje: string = '';
  idCarrito: number = 0;
  map!: L.Map;
  mensajeErrorStock: string | null = null;
  mensajeFlotante: string = '';
  tipoMensaje: 'success' | 'error' | 'warning' = 'success';
  
  productosPorSlide: number = 4;

  constructor(
    private router: Router,
    private carritoProductoService: CarritoProductoService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private productoService: ProductoService
  ) { 
    this.actualizarProductosPorSlide();
  }

  ngOnInit(): void {
    this.cargarProductosDestacados();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.actualizarProductosPorSlide();
    this.generarGrupos();
  }

  private actualizarProductosPorSlide(): void {
    this.productosPorSlide = window.innerWidth < 768 ? 2 : 4;
  }

  cargarProductosDestacados(): void {
    this.productoService.getProductosDestacados().subscribe({
      next: (productos) => {
        this.productosDestacados = productos.filter(p => p.stock > 0);
        this.generarGrupos();
      },
      error: (err) => console.error('Error cargando productos destacados', err),
    });
  }

  generarGrupos(): void {
    this.gruposProductos = [];
    for (let i = 0; i < this.productosDestacados.length; i += this.productosPorSlide) {
      this.gruposProductos.push(this.productosDestacados.slice(i, i + this.productosPorSlide));
    }
  }

  stores = [
    {
      name: 'Tienda Principal Sevilla',
      lat: 37.3891,
      lng: -5.9845,
      address: 'Calle Música 123, Sevilla',
      hours: '10:00 - 20:00',
      image: 'assets/img/tiendas/Tcerro.png',
      description: 'Ubicada en el corazón de Sevilla, junto a la Avenida de la Constitución.'
    },
    {
      name: 'Sucursal Triana',
      lat: 37.3826,
      lng: -6.0033,
      address: 'Calle Triana 45',
      hours: '10:30 - 13:30 / 17:00 - 20:00',
      image: 'assets/img/tiendas/Ttriana.jpeg',
      description: 'En el corazón de Triana, junto a la Iglesia de Santa Ana.'
    }
  ];

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([37.3891, -5.9845], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.stores.forEach(store => {
      const marker = L.marker([store.lat, store.lng]).addTo(this.map);
      marker.on('click', () => {
        this.selectedStore = store;
      });
    });

    this.map.on('click', () => {
      this.selectedStore = null;
    });
  }

  abrirModal(producto: any): void {
    console.log('Abriendo modal para producto:', producto);
    this.productoSeleccionado = producto;
    this.cantidadSeleccionada = 1;
    this.mensajeError = '';
    this.resetearMensajeError();

    setTimeout(() => {
      const modal = document.getElementById('productoModal');
      console.log('Modal element:', modal);
      if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
      } else {
        console.error('Modal element not found');
      }
    }, 0);
  }

  confirmarCantidad(): void {
    if (!this.authService.isLoggedIn()) {
      this.cerrarModal();
      this.router.navigate(['/login']);
      return;
    }

    if (this.cantidadSeleccionada > this.productoSeleccionado.stock) {
      this.mensajeErrorStock = 'No hay suficiente stock disponible';
      return;
    }

    if (this.idCarrito === 0) {
      this.obtenerCarrito(() => {
        this.agregarAlCarrito();
      });
    } else {
      this.agregarAlCarrito();
    }
  }

  agregarAlCarrito(): void {
    console.log('Agregando al carrito:', {
      idCarrito: this.idCarrito,
      idProducto: this.productoSeleccionado.idProducto,
      cantidad: this.cantidadSeleccionada
    });

    const item = {
      idCarrito: this.idCarrito,
      idProducto: this.productoSeleccionado.idProducto,
      cantidad: this.cantidadSeleccionada
    };

    this.carritoProductoService.agregarCarritoProducto(item).subscribe({
      next: (response) => {
        console.log('Producto agregado exitosamente:', response);
        this.cerrarModal();
        this.mostrarMensajeFlotante('Producto añadido al carrito', 'success');
      },
      error: (error) => {
        console.error('Error al añadir producto al carrito:', error);
        this.mensajeErrorStock = 'Error al añadir producto al carrito';
      }
    });
  }

  obtenerCarrito(callback?: () => void): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    console.log('Usuario obtenido:', usuario);

    if (usuario.idUsuario) {
      this.carritoService.getCarritoPorUsuario(usuario.idUsuario).subscribe({
        next: (carrito: any) => {
          console.log('Carrito obtenido:', carrito);
          this.idCarrito = carrito.idCarrito;
          if (callback) {
            callback();
          }
        },
        error: (error) => {
          console.error('Error al obtener carrito:', error);
          this.mensajeErrorStock = 'Error al obtener el carrito del usuario';
        }
      });
    } else {
      console.error('No se encontró usuario en localStorage');
    }
  }

  cerrarModal(): void {
    const modal = document.getElementById('productoModal');
    if (modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.resetearMensajeError();
  }

  resetearMensajeError(): void {
    this.mensajeErrorStock = null;
  }

  mostrarMensajeAlerta(texto: string): void {
    this.mensaje = texto;
    this.mostrarMensaje = true;

    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 3000);
  }

  mostrarMensajeFlotante(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    this.mensajeFlotante = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarMensaje = true;

    setTimeout(() => {
      this.ocultarMensajeFlotante();
    }, 3000);
  }

  ocultarMensajeFlotante(): void {
    this.mostrarMensaje = false;
    this.mensajeFlotante = '';
  }

  OcultarMensajeFlotante(): void {
    this.mostrarMensaje = false;
  }
}