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

@Module({
  controllers: [AuditsController],
  providers: [AuditsService],
  exports: [AuditsService],
})
export class AuditsModule {}
