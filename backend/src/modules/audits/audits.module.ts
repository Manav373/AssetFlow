/**
 * @module Audits
 * @description NestJS module wiring for Audit Cycles, Assignments, and Verifications.
 * @authors Developer 2
 * @status Completed
 * @collaboration Imported by AppModule.
 */

import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule],
  controllers: [AuditsController],
  providers: [AuditsService],
  exports: [AuditsService],
})
export class AuditsModule {}
