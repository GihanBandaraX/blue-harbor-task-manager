//api/src/tasks/entities/task.entity.ts

// Defines the structure and allowed statuses of a task.

// Represents all possible task statuses.
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Defines the properties that every task must follow.
export interface Task {
  id: number; // Unique identifier for the task.
  title: string; // Title of the task, describing what needs to be done.
  description?: string; // Optional detailed description of the task.
  status: TaskStatus; // Current status of the task, which can be 'TODO', 'IN_PROGRESS', or 'DONE'.
  dueDate?: Date; // Optional due date for the task, indicating when it should be completed.
  createdAt: Date; // Timestamp indicating when the task was created.
}
