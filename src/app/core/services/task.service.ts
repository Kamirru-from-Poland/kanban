import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getTasks(): Observable<Task[]> {
    const userId = this.auth.getUserId();
    return this.http.get<Task[]>(`${this.apiUrl}?userId=${userId}`);
  }

  addTask(name: string, date: string, priority: string): Observable<Task> {
    const task: Omit<Task, 'id'> = {
      userId: this.auth.getUserId(),
      name,
      date,
      done: false,
      priority: priority as Task['priority']
    };
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  toggleDone(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, { ...task, done: !task.done });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
