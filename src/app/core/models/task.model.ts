export type TaskPriority = 'Pilne' | 'Ważne' | 'Zaplanowane' | 'Zrobione';

export interface Task {
  id: string;
  userId: string;
  name: string;
  date: string;
  done: boolean;
  priority: TaskPriority;
}

export type TaskFilter = 'wszystkie' | 'do-zrobienia' | 'zrobione';
