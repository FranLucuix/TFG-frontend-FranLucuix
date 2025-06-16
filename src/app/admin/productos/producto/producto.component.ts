import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto } from '../../../services/producto.service';
import { ImagenService } from '../../../services/imagen.service';

@Component({
  standalone: true,
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})

export class ProductoComponent implements OnInit {
   productos: Producto[] = [];
  cargando = true;
  error: string | null = null;
  modalAbierto = false;
  modalConfirmacionAbierto = false;
  productoAEliminar: number | null = null;
  imagenSeleccionada: File | null = null;
  editando = false;

  baseUrl = 'http://localhost:8080';

  categorias: string[] = [
    'Accesorios', 'Grabación', 'Guitarras', 'Arco', 'Viento', 'Varios',
    'Libros', 'Liquidación', 'Merchandising', 'Pasión', 'Percusión', 'Teclados'
  ];

  nuevoProducto: Producto = this.initProducto();

  constructor(
    private productoService: ProductoService,
    private imagenService: ImagenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  abrirModal() {
    this.nuevoProducto = this.initProducto();
    this.imagenSeleccionada = null;
    this.editando = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.error = null;
    this.nuevoProducto = this.initProducto();
    this.imagenSeleccionada = null;
    this.editando = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
    }
  }

  guardarProducto() {
    if (this.editando) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto() {
    if (!this.imagenSeleccionada) {
      this.error = 'Debes seleccionar una imagen válida';
      return;
    }

    this.imagenService.subirImagen(this.imagenSeleccionada).subscribe({
      next: (url: string) => {
        this.nuevoProducto.imagenUrl = url;

        this.productoService.crearProducto(this.nuevoProducto).subscribe({
          next: (productoCreado) => {
            this.productos.push(productoCreado);
            setTimeout(() => this.cerrarModal(), 300);
          },
          error: (err) => {
            this.error = 'Error al crear producto';
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.error = 'Error al subir imagen';
        console.error(err);
      }
    });
  }

  actualizarProducto() {
    const subirImagen = this.imagenSeleccionada
      ? this.imagenService.subirImagen(this.imagenSeleccionada)
      : null;

    if (subirImagen) {
      subirImagen.subscribe({
        next: (url: string) => {
          this.nuevoProducto.imagenUrl = url;
          this.confirmarActualizar();
        },
        error: (err) => {
          this.error = 'Error al subir imagen';
          console.error(err);
        }
      });
    } else {
      this.confirmarActualizar();
    }
  }

  confirmarActualizar() {
    this.productoService.actualizarProducto(this.nuevoProducto.idProducto, this.nuevoProducto).subscribe({
      next: (productoActualizado) => {
        const index = this.productos.findIndex(p => p.idProducto === productoActualizado.idProducto);
        if (index !== -1) {
          this.productos[index] = productoActualizado;
        }
        setTimeout(() => this.cerrarModal(), 300);
      },
      error: (err) => {
        this.error = 'Error al actualizar producto';
        console.error(err);
      }
    });
  }

  editarProducto(producto: Producto) {
    this.nuevoProducto = { ...producto };
    this.imagenSeleccionada = null;
    this.editando = true;
    this.modalAbierto = true;
  }

  abrirModalConfirmacion(id: number) {
    this.productoAEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.productoAEliminar = null;
  }

  confirmarBorrado() {
    if (this.productoAEliminar !== null) {
      this.borrarProducto(this.productoAEliminar);
      this.cerrarModalConfirmacion();
    }
  }

  borrarProducto(id: number) {
    this.productoService.borrarProducto(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.idProducto !== id);
      },
      error: (err) => {
        this.error = 'Error al borrar producto';
        console.error(err);
      }
    });
  }

  private initProducto(): Producto {
    return {
      idProducto: 0,
      nombre: '',
      precio: 0,
      precioRebajado: 0,
      stock: 0,
      descripcion: '',
      categoria: '',
      imagenUrl: ''
    };
  }

  eliminarImagen() {
  this.nuevoProducto.imagenUrl = '';
  this.imagenSeleccionada = null;
}

 ordenCampo: string = '';
  ordenAscendente: boolean = true;

  get productosOrdenados(): Producto[] {
    return this.productos.slice().sort((a, b) => {
      const campo = this.ordenCampo;
      if (!campo) return 0;

      const valorA = (a as any)[campo];
      const valorB = (b as any)[campo];

      if (typeof valorA === 'string') {
        return this.ordenAscendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return this.ordenAscendente
        ? valorA - valorB
        : valorB - valorA;
    });
  }

  ordenarPor(campo: string) {
    if (this.ordenCampo === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenCampo = campo;
      this.ordenAscendente = true;
    }
  }

  iconoOrden(campo: string): string {
    if (this.ordenCampo !== campo) return 'bi bi-arrow-down-up';
    return this.ordenAscendente ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }




}
