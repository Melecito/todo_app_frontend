import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TasksService } from '../services/tasks.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {

  private router = inject(Router);
  private taskService = inject(TasksService);

  tasks = signal<any[]>([]);
  loading = signal<boolean>(false);

  // 🔹 Cargar tareas
  async loadTasks() {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.taskService.getTasks());
      this.tasks.set(response || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las tareas',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      this.loading.set(false);
    }
  }

  // 🔹 Crear tarea
  async openCreateTask() {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva tarea',
      html: `
        <input id="title" class="swal2-input" placeholder="Título de la tarea">
        <textarea id="description" class="swal2-textarea" placeholder="Descripción (opcional)"></textarea>
      `,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#2563eb',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
        if (!title) {
          Swal.showValidationMessage('El título es obligatorio');
          return false;
        }
        return { title, description };
      }
    });

    if (formValues) {
      try {
        const response = await firstValueFrom(
          this.taskService.addTask({
            title: formValues.title,
            description: formValues.description,
            completed: false
          })
        );

        this.tasks.update(prev => [...prev, response.task]);
        Swal.fire({
          icon: 'success',
          title: 'Tarea creada',
          text: 'La tarea se ha guardado correctamente',
          confirmButtonColor: '#2563eb'
        });
      } catch (error) {
        console.error('Error al crear tarea:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la tarea',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  }

  // 🔹 Editar tarea
  async editTask(task: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar tarea',
      html: `
        <input id="title" class="swal2-input" placeholder="Título" value="${task.title}">
        <textarea id="description" class="swal2-textarea" placeholder="Descripción (opcional)">${task.description || ''}</textarea>
      `,
      confirmButtonText: 'Guardar cambios',
      confirmButtonColor: '#2563eb',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('description') as HTMLTextAreaElement).value.trim();
        if (!title) {
          Swal.showValidationMessage('El título es obligatorio');
          return false;
        }
        return { title, description };
      }
    });

    if (formValues) {
      try {
        const response = await firstValueFrom(
          this.taskService.updateTask(task.id, {
            title: formValues.title,
            description: formValues.description
          })
        );

        this.tasks.update(tasks =>
          tasks.map(t => t.id === task.id ? { ...t, ...formValues } : t)
        );

        Swal.fire({
          icon: 'success',
          title: 'Tarea actualizada',
          text: response.message || 'Los cambios se guardaron correctamente',
          confirmButtonColor: '#2563eb'
        });
      } catch (error) {
        console.error('Error al editar tarea:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la tarea',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  }

  // 🔹 Cambiar estado (completada / pendiente)
  async toggleCompleted(task: any) {
  try {
    await firstValueFrom(
      this.taskService.updateTask(task.id, { completed: !task.completed })
    );

    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === task.id ? { ...t, completed: !task.completed } : t
      )
    );

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: task.completed ? 'Marcada como pendiente' : 'Tarea completada',
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar el estado de la tarea',
      confirmButtonColor: '#dc2626'
    });
  }
}


  // 🔹 Eliminar tarea
  async deleteTask(id: number) {
    const confirm = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (confirm.isConfirmed) {
      try {
        await firstValueFrom(this.taskService.deleteTask(id));
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));

        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'Tarea eliminada correctamente',
          confirmButtonColor: '#2563eb'
        });
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la tarea',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  }

  // 🔹 Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // 🔹 Inicializar componente
  ngOnInit(): void {
    this.loadTasks();
  }
}
