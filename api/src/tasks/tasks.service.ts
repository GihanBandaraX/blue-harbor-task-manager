//api-app/src/tasks/tasks.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

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
    // LLM: Returns all tasks stored in memory.
  findAll(): Task[] {
    return this.tasks;
  }

    // LLM: Finds a task by ID or throws an error if it does not exist.
  findOne(id: number): Task {
    const task = this.tasks.find((task) => task.id === id); // Searches for a task with the specified ID in the in-memory tasks array.

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

    // LLM: Updates an existing task with the provided data.
  update(id: number, updateData: UpdateTaskDto): Task {
    const task = this.findOne(id); //finds the task to be updated by ID, throwing an error if it does not exist.

    Object.assign(task, updateData);

    if (updateData.dueDate !== undefined) {
      task.dueDate = updateData.dueDate //  Sets the due date of the task to a new Date object if a due date is provided in the update data, or undefined if not provided.
        ? new Date(updateData.dueDate)
        : undefined;
    }

    return task;
  }

    // LLM: Deletes an existing task by ID.
  remove(id: number): void {
    const task = this.findOne(id); //finds the task to be deleted by ID, throwing an error if it does not exist.

    this.tasks = this.tasks.filter(
      (existingTask) => existingTask.id !== task.id, // Filters out the task to be deleted from the in-memory tasks array, effectively removing it.
    );
  }
}

