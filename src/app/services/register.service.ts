import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { first, firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  async registerUser(user: { username: string; email: string; password: string }): Promise<any> {
    console.log('➡️ Intentando registrar usuario:', user);
    try {
      const response = await firstValueFrom(this.http.post(this.apiUrl, user));
      console.log('Usuario registrado correctamente', response);
      return response;
    }catch(error) {
      console.error('Error al registrar usuario', error);
      throw error;
    }
  };
}
