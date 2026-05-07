import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

interface CalendarDay {
  dayNum: number | null;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarComponent implements OnInit {
  tasks: Task[] = [];
  currentDate = new Date();
  weeks: CalendarDay[][] = [];
  selectedDay: CalendarDay | null = null;

  readonly dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
  readonly monthNames = [
    'Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
    'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // Buduj siatkę natychmiast — kalendarz widoczny zanim zadania się załadują
    this.buildCalendar();
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.buildCalendar();
    });
  }

  get monthLabel(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  get monthTasks(): Task[] {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    return this.tasks
      .filter(t => t.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.selectedDay = null;
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedDay = null;
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    if (!day.dayNum) return;
    this.selectedDay = this.selectedDay?.dateStr === day.dateStr ? null : day;
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const todayStr = this.toDateStr(new Date());

    // Poniedziałek = 0, niedziela = 6
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    const days: CalendarDay[] = [];

    // Puste komórki przed pierwszym dniem
    for (let i = 0; i < startDow; i++) {
      days.push({ dayNum: null, dateStr: '', isToday: false, isCurrentMonth: false, tasks: [] });
    }

    // Dni miesiąca
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = this.tasks.filter(t => t.date === dateStr);
      days.push({ dayNum: d, dateStr, isToday: dateStr === todayStr, isCurrentMonth: true, tasks: dayTasks });
    }

    // Uzupełnij do pełnych tygodni
    while (days.length % 7 !== 0) {
      days.push({ dayNum: null, dateStr: '', isToday: false, isCurrentMonth: false, tasks: [] });
    }

    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

  dotClass(task: Task): string {
    if (task.done) return 'dot-done';
    const map: Record<string, string> = { 'Pilne': 'dot-urgent', 'Ważne': 'dot-important', 'Zaplanowane': 'dot-planned' };
    return map[task.priority] ?? 'dot-planned';
  }
}
