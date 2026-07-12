/**
 * @module Allocations
 * @description NestJS module wiring for the Allocations domain (checkout / return workflow).
 * @authors Developer 2
 * @status Completed
 * @collaboration Imported by AppModule. Shares PrismaModule for DB access.
 */

import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';

@Module({
  controllers: [AllocationsController],
  providers: [AllocationsService],
  exports: [AllocationsService],
})
export class AllocationsModule {}
