import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterModule,   
    HeaderComponent,
    FooterComponent,
  ],
})
export class AppComponent {}
