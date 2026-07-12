/**
 * @module Bookings
 * @description DTO for creating a new resource booking slot.
 * @authors Developer 2
 * @status Completed
 * @collaboration Consumed by BookingsController POST /bookings endpoint.
 *                Frontend Developer D consumes for calendar booking form.
 */

import { IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  assetId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
