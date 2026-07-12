/**
 * @module Prisma
 * @description Database connection client service using Prisma ORM.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Shared connection service used by all backend domain modules.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
