//api/src/tasks/dto/create-task.dto.ts

// Validates incoming data when creating a new task.

import {
  IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength,
} from 'class-validator';

import { TaskStatus } from '../entities/task.entity.js';

export class CreateTaskDto {
  @IsString() // Ensures the title is a string.
  @IsNotEmpty() // Ensures the title is not empty.
  @MaxLength(100) // Ensures the title does not exceed 100 characters.
  title: string;

  @IsOptional() // Indicates that the description is not required.
  @IsString() // Ensures the description is a string.
  @MaxLength(500) // Ensures the description does not exceed 500 characters.
  description?: string; // Optional description for the task.

  @IsOptional() // Indicates that the status is not required.
  @IsEnum(TaskStatus) // Ensures the status is one of the defined TaskStatus enum values.
  status?: TaskStatus; // Optional status for the task, defaults to 'TODO' if not provided.

  @IsOptional() // Indicates that the due date is not required.
  @IsDateString() // Ensures the due date is a valid ISO 8601 date string.
  dueDate?: string; // Optional due date for the task, represented as a string in ISO 8601 format.
}
