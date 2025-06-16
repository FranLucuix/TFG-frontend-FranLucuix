import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  error: string = '';
  form: FormGroup;  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.createForm(); 
  }

  createForm() {
    return this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.authService.login({
      username: username ?? '',
      password: password ?? '',
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.error = err.error || 'Error al iniciar sesión'
    });
  }
}
