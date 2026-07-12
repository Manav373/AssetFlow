/**
 * @module Transfers
 * @description NestJS module wiring for the Transfer Request approval pipeline.
 * @authors Developer 2
 * @status Completed
 * @collaboration Imported by AppModule.
 */

import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
