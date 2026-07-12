/**
 * @module Bookings
 * @description REST controller for calendar resource booking slots management.
 * @authors Developer 2
 * @status Completed
 * @collaboration Frontend Developer D consumes GET /bookings/slots for calendar availability view.
 *                Coordinate with Developer D on query param contract for slots endpoint.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** POST /bookings — Create a new time-slot booking (any authenticated user) */
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  /** GET /bookings — List all bookings, optionally filter by assetId */
  @Get()
  findAll(@Query('assetId') assetId?: string) {
    return this.bookingsService.findAll(assetId);
  }

  /**
   * GET /bookings/slots — Get booked time slots for an asset on a given date.
   * Query params: assetId (required), date (required, ISO date string e.g. 2026-07-15)
   * Coordinate with Developer D (Frontend) on this contract.
   * Socket.IO event namespace: dashboard:refresh (coordinate with Developer D)
   */
  @Get('slots')
  getSlots(@Query('assetId') assetId: string, @Query('date') date: string) {
    return this.bookingsService.getSlots(assetId, date);
  }

  /** GET /bookings/:id — Get a single booking by ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  /** PATCH /bookings/:id/cancel — Cancel a booking (booking owner only) */
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancel(id, req.user.id);
  }
}
