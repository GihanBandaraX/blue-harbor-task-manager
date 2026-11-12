//api-app/src/tasks/entities/task.entity.ts

// LLM: Defines the structure and allowed statuses of a task.

// Represents all possible task statuses.
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Defines the properties that every task must follow.
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
}
