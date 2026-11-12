//api/src/tasks/dto/update-task.dto.ts

// Validates partial updates to an existing task.

import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
