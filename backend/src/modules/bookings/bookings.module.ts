/**
 * @module Bookings
 * @description NestJS module wiring for the Resource Booking (calendar slots) domain.
 * @authors Developer 2
 * @status Completed
 * @collaboration Imported by AppModule.
 */

import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
