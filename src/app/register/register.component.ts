import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../environments/environment';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private fb =  inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  message = signal<string>('');

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if(this.form.valid){
      console.log('📤 Enviando datos:', this.form.value);

      this.http.post(`${environment.apiUrl}/users`, this.form.value)
      .subscribe({
        next: (res: any) => { this.message.set(res.message);

        Swal.fire({
          title: 'Registro exitoso',
          text: res.message,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        }).then(() => {
              // 🚀 Redirigir al login después de aceptar
              this.router.navigate(['/login']);
            });

        this.form.reset();
      },
        error: (err) => {
          console.error(err);
          this.message.set('Error al conectar con el servidor');

          Swal.fire({
            title: 'Error',
            text: 'No se pudo conectar con el servidor. Intentalo mas tarde.',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar'
          });

        }
      });

    }else{
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }

}
