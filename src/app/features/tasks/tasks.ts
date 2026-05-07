import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskFilter } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filter: TaskFilter = 'wszystkie';
  addForm: FormGroup;
  editingTask: Task | null = null;
  editForm: FormGroup;

  readonly priorities = ['Pilne', 'Ważne', 'Zaplanowane'];

  constructor(private taskService: TaskService, private fb: FormBuilder) {
    const today = new Date().toISOString().split('T')[0];
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      date: [today, Validators.required],
      priority: ['Zaplanowane']
    });
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', Validators.required],
      priority: ['Zaplanowane']
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks.sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  get filtered(): Task[] {
    if (this.filter === 'do-zrobienia') return this.tasks.filter(t => !t.done);
    if (this.filter === 'zrobione') return this.tasks.filter(t => t.done);
    return this.tasks;
  }

  count(f: TaskFilter): number {
    if (f === 'do-zrobienia') return this.tasks.filter(t => !t.done).length;
    if (f === 'zrobione') return this.tasks.filter(t => t.done).length;
    return this.tasks.length;
  }

  setFilter(f: TaskFilter): void {
    this.filter = f;
    this.editingTask = null;
  }

  addTask(): void {
    if (this.addForm.invalid) return;
    const { name, date, priority } = this.addForm.value;
    this.taskService.addTask(name.trim(), date, priority).subscribe(() => {
      const today = new Date().toISOString().split('T')[0];
      this.addForm.reset({ date: today, priority: 'Zaplanowane' });
      this.load();
    });
  }

  toggleDone(task: Task): void {
    this.taskService.toggleDone(task).subscribe(() => this.load());
  }

  startEdit(task: Task): void {
    this.editingTask = task;
    this.editForm.setValue({ name: task.name, date: task.date, priority: task.priority });
  }

  saveEdit(): void {
    if (!this.editingTask || this.editForm.invalid) return;
    const updated: Task = { ...this.editingTask, ...this.editForm.value, name: this.editForm.value.name.trim() };
    this.taskService.updateTask(updated).subscribe(() => {
      this.editingTask = null;
      this.load();
    });
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe(() => this.load());
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }

  priorityClass(task: Task): string {
    if (task.done) return 'badge-done';
    const map: Record<string, string> = { 'Pilne': 'badge-urgent', 'Ważne': 'badge-important', 'Zaplanowane': 'badge-planned' };
    return map[task.priority] ?? 'badge-planned';
  }

  priorityLabel(task: Task): string {
    return task.done ? 'Zrobione' : task.priority;
  }
}
