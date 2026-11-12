
import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';

@Injectable()
export class TasksService {
  // LLM: Stores tasks temporarily in memory.
  private tasks: Task[] = [];

  // LLM: Generates unique IDs for newly created tasks.
  private nextId = 1;

  // LLM: Creates a new task and stores it in memory.
  create(taskData: CreateTaskDto): Task {
    const newTask: Task = {
      id: this.nextId++, // Assigns a unique ID to the new task.
      title: taskData.title, // Sets the title of the task from the provided data.
      description: taskData.description, // Sets the description of the task from the provided data, if available.
      status: taskData.status ?? TaskStatus.TODO, // Sets the status of the task, defaulting to 'TODO' if not provided.
      dueDate: taskData.dueDate // Sets the due date of the task from the provided data, if available.
        ? new Date(taskData.dueDate)
        : undefined,
      createdAt: new Date(), // Records the current date and time as the creation timestamp of the task.
    };

    this.tasks.push(newTask); // Adds the newly created task to the in-memory tasks array.

    return newTask;
  }
}
