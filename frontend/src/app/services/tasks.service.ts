import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<any[]>{
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, {headers});
  }

  addTask(task: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.apiUrl, task, {headers});
  }

  updateTask(id: number, task: any): Observable<any>{
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<any>(url, task, {headers});
  }

  deleteTask(id: number):Observable<any>{
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url, {headers});
  }

  private getAuthHeaders(): HttpHeaders{
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
