import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoService, Pedido } from '../services/pedido.service';
import { DetallePedidoService } from '../services/detalle-pedido.service';
import { CarritoProductoService } from '../services/carrito-producto.service';
import { CarritoService, Carrito } from '../services/carrito.service';
import { ProductoService, Producto } from '../services/producto.service';
import { CarritoProducto } from '../services/carrito-producto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService, Pago } from '../services/pago.service';
import { EuroPipe } from '../shared/pipes/euro.pipe';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [FormsModule, CommonModule, EuroPipe],
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit {

  direccion: string = '';
  metodoEnvio: string = 'envio';
  metodoPago: number = 0;
  metodosPago: Pago[] = [];

  items: { producto: Producto; cantidad: number }[] = [];
  total: number = 0;
  error: string | null = null;

  idUsuario: number = 0;
  idCarrito: number = 0;

  mostrarModalTarjeta: boolean = false;
  tarjeta = {
    nombre: '',
    numero: '',
    mesExp: '',
    anioExp: '',
    cvv: ''
  };
  tarjetaValida: boolean = false;

  tiendas = [
    { nombre: 'Tienda Principal Sevilla', direccion: 'Calle Música 123, Sevilla' },
    { nombre: 'Sucursal Triana', direccion: 'Calle Triana 45' }
  ];





  constructor(
    private pedidoService: PedidoService,
    private detalleService: DetallePedidoService,
    private carritoProductoService: CarritoProductoService,
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private pagoService: PagoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (!usuarioJson) {
      this.error = 'Debe iniciar sesión.';
      return;
    }

    const usuario = JSON.parse(usuarioJson);
    this.idUsuario = usuario.idUsuario;

    this.pagoService.getPagos().subscribe({
      next: (pagos: Pago[]) => {
        this.metodosPago = pagos;
        if (pagos.length > 0) {
          this.metodoPago = pagos[0].idPago;
          this.tarjetaValida = this.metodoPago !== 1;
        }
      },
      error: err => {
        console.error('Error al cargar métodos de pago', err);
        this.error = 'No se pudieron cargar los métodos de pago.';
      }
    });

    this.carritoService.getCarritoPorUsuario(this.idUsuario).subscribe({
      next: (carrito: Carrito) => {
        this.idCarrito = carrito.idCarrito;

        this.carritoProductoService.getCarritoProductos().subscribe({
          next: (productos: CarritoProducto[]) => {
            const productosUsuario = productos.filter(p => p.idCarrito === this.idCarrito);
            const peticiones = productosUsuario.map(p =>
              this.productoService.getProductoPorId(p.idProducto).toPromise().then(prod => {
                if (prod) {
                  return {
                    producto: prod,
                    cantidad: p.cantidad
                  };
                }
                return null;
              })
            );

            Promise.all(peticiones).then(resultados => {
              const filtrados = resultados.filter((item): item is { producto: Producto; cantidad: number } => item !== null);
              this.items = filtrados;
              this.total = filtrados.reduce((acc, item) =>
                acc + this.getPrecioFinal(item.producto) * item.cantidad, 0);

            });

          },
          error: err => {
            console.error(err);
            this.error = 'No se pudieron obtener los productos del carrito.';
          }
        });
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudo obtener el carrito del usuario.';
      }
    });
  }


  onMetodoPagoChange(): void {
    const pagoId = Number(this.metodoPago);
    this.metodoPago = pagoId;

    if (pagoId === 1) {
      this.tarjetaValida = false;
    } else {
      this.cerrarModal();
      this.tarjetaValida = true;
    }
  }

  abrirModalTarjeta(): void {
    this.mostrarModalTarjeta = true;
  }

  cerrarModal(): void {
    this.mostrarModalTarjeta = false;
    this.limpiarTarjeta();
    this.tarjetaValida = false;
  }


  limpiarTarjeta(): void {
    this.tarjeta = {
      nombre: '',
      numero: '',
      mesExp: '',
      anioExp: '',
      cvv: ''
    };
  }

  formTarjetaValido(): boolean {
    const { nombre, numero, mesExp, anioExp, cvv } = this.tarjeta;
    const numeroClean = numero.replace(/\s+/g, '');
    const regexNumero = /^\d{16}$/;
    const regexMes = /^(0[1-9]|1[0-2])$/;
    const regexAnio = /^\d{2}$/;
    const regexCvv = /^\d{3}$/;

    return (
      nombre.trim().length > 0 &&
      regexNumero.test(numeroClean) &&
      regexMes.test(mesExp) &&
      regexAnio.test(anioExp) &&
      regexCvv.test(cvv)
    );
  }

  validarTarjeta(): void {
    if (this.formTarjetaValido()) {
      this.tarjetaValida = true;
      this.mostrarModalTarjeta = false;
    } else {
      alert('Por favor, complete correctamente todos los campos de la tarjeta.');
    }
  }

  confirmarPedido(): void {
    if (this.metodoEnvio === 'envio' && this.direccion.trim() === '') {
      this.error = 'Debe ingresar una dirección válida.';
      return;
    }

    if (this.metodoPago === 1 && !this.tarjetaValida) {
      this.error = 'Debe validar la información de la tarjeta.';
      return;
    }

    const fechaPedido = new Date();
    const fechaEntrega = new Date(fechaPedido);
    fechaEntrega.setDate(fechaEntrega.getDate() + 2);

    const nuevoPedido: Pedido = {
      idPedido: 0,
      idUsuario: this.idUsuario,
      idPago: this.metodoPago,
      fechaPedido: fechaPedido.toISOString(),
      fechaEntrega: fechaEntrega.toISOString(),
      total: this.total,
      estado: 'confirmado',
      direccion: this.metodoEnvio === 'recogida'
        ? `RECOGER EN TIENDA - ${this.direccion}`
        : this.direccion
    };

    this.pedidoService.crearPedido(nuevoPedido).subscribe({
      next: (pedidoCreado) => {
        const acciones = this.items.map(item => {
          const detalle = {
            idPedido: pedidoCreado.idPedido,
            idProducto: item.producto.idProducto,
            cantidad: item.cantidad,
            precioUnitario: this.getPrecioFinal(item.producto)


          };

          return this.detalleService.crearDetalle(detalle).toPromise()
            .then(() => {
              return this.carritoProductoService.eliminarCarritoProducto(this.idCarrito, item.producto.idProducto).toPromise();
            });
        });

        Promise.all(acciones).then(() => {
          this.router.navigate(['/cuenta']);
        });
      },
      error: err => {
        console.error(err);
        this.error = 'Error al crear el pedido.';
      }
    });
  }

  getPrecioFinal(producto: Producto): number {
    return producto.precioRebajado && producto.precioRebajado > 0
      ? producto.precioRebajado
      : producto.precio;
  }

  onNumeroTarjetaInput() {
    this.tarjeta.numero = this.tarjeta.numero.replace(/\D/g, '').slice(0,16);
  }

  onMesExpInput() {
    this.tarjeta.mesExp = this.tarjeta.mesExp.replace(/\D/g, '');
  }

  onAnioExpInput() {
    this.tarjeta.anioExp = this.tarjeta.anioExp.replace(/\D/g, '');
  }

  onCvvInput() {
    this.tarjeta.cvv = this.tarjeta.cvv.replace(/\D/g, '');
  }

}
