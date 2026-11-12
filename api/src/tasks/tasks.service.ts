
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskStatus } from './entities/task.entity.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Creates and saves a new task in the database.
  async create(taskData: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status ?? TaskStatus.TODO,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate)
          : null,
      },
    });
  }

  // Returns all tasks from the database.
  async findAll() {
    return this.prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Finds a task by ID or throws an error if it does not exist.
  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // Updates an existing task in the database.
  async update(id: number, updateData: UpdateTaskDto) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
        dueDate:
          updateData.dueDate !== undefined
            ? updateData.dueDate
              ? new Date(updateData.dueDate)
              : null
            : undefined,
      },
    });
  }

  // Deletes an existing task from the database.
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
