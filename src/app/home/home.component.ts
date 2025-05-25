import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/img/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/img/leaflet/marker-icon.png',
  shadowUrl: 'assets/img/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  selectedStore: any = null;
  map!: L.Map;

  

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
}
