import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService, Producto } from '../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Aquí importa el módulo que contiene NgModel
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor], // ✅ Usa FormsModule, no NgModel directamente
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

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService
  ) {}

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
      error: (err) => {
        this.error = 'Error al cargar productos';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  confirmarCantidad() {
    if (this.productoSeleccionado && this.cantidadSeleccionada > 0) {
      console.log(`Has seleccionado ${this.cantidadSeleccionada} de ${this.productoSeleccionado.nombre}`);
      this.cantidadSeleccionada = 1;
    }
  }
}
