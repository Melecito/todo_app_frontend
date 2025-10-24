import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  private apiUrl = `${ environment.apiUrl }/login`; // ⚙️ Ajusta a tu backend real

  constructor(private http: HttpClient, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor ingresa tu correo y contraseña.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    this.loading = true;

    try {
      const response: any = await this.http.post(this.apiUrl, {
        email: this.email,
        password: this.password
      }).toPromise();

      if (response?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso.',
          timer: 2000,
          showConfirmButton: false
        });
        localStorage.setItem('token', response.token);

        setTimeout(() => {
          this.router.navigate(['/tasks']); // o donde quieras dirigir
        }, 2000);


      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response?.error || 'Credenciales incorrectas',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      this.loading = false;
    }
  }
}
