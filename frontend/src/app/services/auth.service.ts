import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(false);

  private apiUrl = `${environment.apiUrl}/login`;

  async loginUser(credentials: { email: string; password: string }): Promise<void> {
    try{
      const response: any = await firstValueFrom( this.http.post(this.apiUrl, credentials));

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        this.isAuthenticated.set(true);

        await Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: 'Bienvenido nuevamente',
          timer: 1800,
          showConfirmButton: false
        });

        this.router.navigate(['/tasks']);

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El servidor no devolvió un token válido'
        });
      }
    } catch(error: any) {
      console.error('Error al inciar sesión:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text:
          error.status === 401
          ? 'Correo o contraseña incorrectos'
          : 'Ocurrió un problema con el servidor. Intenta mas tarde.',
      });
    }
  }

  logout(): void{
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);

    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      timer: 1500,
      showConfirmButton: false
    });

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  checkAuthStatus(): void {
    const token = this.getToken();
    this.isAuthenticated.set(!!token);
  }
}
