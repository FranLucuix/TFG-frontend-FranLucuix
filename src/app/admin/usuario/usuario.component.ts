import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  standalone: true,
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  nuevoUsuario: Usuario = this.initUsuario();
  modalAbierto = false;
  modalConfirmacionAbierto = false;
  usuarioAEliminar: number | null = null;
  editando = false;
  error: string | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        console.error(err);
      }
    });
  }

  abrirModal() {
    this.nuevoUsuario = this.initUsuario();
    this.editando = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.nuevoUsuario = this.initUsuario();
    this.editando = false;
    this.error = null;
  }
guardarUsuario() {
  if (this.editando) {
    const usuarioAActualizar = { ...this.nuevoUsuario };

    if (!usuarioAActualizar.password?.trim()) {
      delete usuarioAActualizar.password;
    }

    this.usuarioService.actualizarUsuario(usuarioAActualizar.idUsuario, usuarioAActualizar).subscribe({
      next: (actualizado) => {
        const index = this.usuarios.findIndex(u => u.idUsuario === actualizado.idUsuario);
        if (index !== -1) this.usuarios[index] = actualizado;
        this.cerrarModal();
      },
      error: (err) => {
        this.error = 'Error al actualizar usuario';
        console.error(err);
      }
    });

  } else {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (nuevo) => {
        this.usuarios.push(nuevo);
        this.cerrarModal();
      },
      error: (err) => {
        this.error = 'Error al crear usuario';
        console.error(err);
      }
    });
  }
}


  editarUsuario(usuario: Usuario) {
    this.nuevoUsuario = { ...usuario, password: '' };
    this.editando = true;
    this.modalAbierto = true;
  }

  abrirModalConfirmacion(id: number) {
    this.usuarioAEliminar = id;
    this.modalConfirmacionAbierto = true;
  }

  cerrarModalConfirmacion() {
    this.modalConfirmacionAbierto = false;
    this.usuarioAEliminar = null;
  }

  confirmarBorrado() {
    if (this.usuarioAEliminar !== null) {
      this.usuarioService.borrarUsuario(this.usuarioAEliminar).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== this.usuarioAEliminar);
          this.cerrarModalConfirmacion();
        },
        error: (err) => {
          this.error = 'Error al borrar usuario';
          console.error(err);
        }
      });
    }
  }

  private initUsuario(): Usuario {
    return {
      idUsuario: 0,
      nombre: '',
      email: '',
      rol: 'cliente',
      password: ''
    };
  }
}
