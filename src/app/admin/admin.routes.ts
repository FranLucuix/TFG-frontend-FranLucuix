// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./productos/producto/producto.component').then(m => m.ProductoComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuario/usuario.component').then(m => m.UsuarioComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pedido/pedido.component').then(m => m.PedidoComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./pago/pago.component').then(m => m.PagoComponent),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('../carrito/carrito.component').then(m => m.CarritoComponent),
      },
      {
        path: 'carrito-producto',
        loadComponent: () =>
          import('./carrito-producto/carrito-producto.component').then(m => m.CarritoProductoComponent),
      }
    ]
  }
];
