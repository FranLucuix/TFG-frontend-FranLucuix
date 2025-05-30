import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'euro',
  standalone: true 
})
export class EuroPipe implements PipeTransform {
  transform(value: number, decimales: number = 2): string {
    if (value == null || isNaN(value)) return '0,00 €';

    const opciones = {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    };

    return value.toLocaleString('es-ES', opciones) + ' €';
  }
}
