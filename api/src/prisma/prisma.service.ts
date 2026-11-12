
// Manages the Prisma database connection for the NestJS application.

import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Connects to SQLite when the application starts.
  async onModuleInit() {
    await this.$connect();
  }

  // Disconnects from SQLite when the application shuts down.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
