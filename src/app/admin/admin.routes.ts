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
    ]
  }
];

