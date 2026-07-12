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
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
