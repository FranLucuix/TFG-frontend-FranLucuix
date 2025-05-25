import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Categoria {
  nombre: string;
  imagen: string;
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  imports:[CommonModule],
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent {

  categorias: Categoria[] = [
    { nombre: 'Accesorios', imagen: 'assets/img/categorias/accesorio1.png' },
    { nombre: 'Grabación', imagen: 'assets/img/categorias/grabacion1.png' },
    { nombre: 'Guitarras', imagen: 'assets/img/categorias/guitarras1.png' },
    { nombre: 'Arco', imagen: 'assets/img/categorias/arco1.png' },
    { nombre: 'Viento', imagen: 'assets/img/categorias/cornetas1.png' },
    { nombre: 'Varios', imagen: 'assets/img/categorias/varios1.png' },
    { nombre: 'Libros', imagen: 'assets/img/categorias/libros1.png' },
    { nombre: 'Liquidación', imagen: 'assets/img/categorias/liquidacion-300x300.png' },
    { nombre: 'Merchandising', imagen: 'assets/img/categorias/llaveros1.png' },
    { nombre: 'Pasión', imagen: 'assets/img/categorias/pasion1.png' },
    { nombre: 'Percusión', imagen: 'assets/img/categorias/percusion1.png' },
    { nombre: 'Teclados', imagen: 'assets/img/categorias/pianos1.png' },
  ];

  constructor(private router: Router) {}

  verCategoria(nombreCategoria: string): void {
    this.router.navigate(['/productos', nombreCategoria]);
  }
}
