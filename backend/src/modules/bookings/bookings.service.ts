/**
 * @module Bookings
 * @description Service implementing time-slot collision avoidance logic for bookable assets.
 *              Collision query: startTime < newEndTime AND endTime > newStartTime AND status != CANCELLED.
 *              Throws BadRequestException(400) if collision found.
 * @authors Developer 2
 * @status Completed
 * @collaboration BookingsController; Frontend Developer D for GET /bookings/slots availability API.
 *                Coordinate with Developer D on slots query parameter contract.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new booking after validating no time-slot collision exists.
   * DB-level constraint: endTime must be after startTime.
   */
  async create(dto: CreateBookingDto, bookedById: string) {
    const { assetId, startTime, endTime } = dto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // --- Database-level constraint: endTime > startTime ---
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Verify asset exists and is bookable
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset with ID ${assetId} not found`);
    if (!asset.isBookable) {
      throw new BadRequestException(`Asset ${asset.assetTag} is not marked as bookable`);
    }

    // --- Time-slot collision query ---
    // Overlap condition: existing.startTime < newEndTime AND existing.endTime > newStartTime
    const collision = await this.prisma.resourceBooking.findFirst({
      where: {
        assetId,
        status: { not: 'CANCELLED' },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: {
        bookedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (collision) {
      throw new BadRequestException('Asset is already booked during this time frame');
    }

    return this.prisma.resourceBooking.create({
      data: {
        assetId,
        bookedById,
        startTime: start,
        endTime: end,
        status: 'UPCOMING',
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        bookedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAll(assetId?: string) {
    return this.prisma.resourceBooking.findMany({
      where: assetId ? { assetId } : undefined,
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        bookedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.resourceBooking.findUnique({
      where: { id },
      include: {
        asset: true,
        bookedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!booking) throw new NotFoundException(`Booking with ID ${id} not found`);
    return booking;
  }

  /**
   * GET /bookings/slots?assetId=&date=
   * Returns all active (non-cancelled) bookings for a given asset on a given date.
   * Coordinate with Developer D (Frontend) on this contract.
   */
  async getSlots(assetId: string, date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.prisma.resourceBooking.findMany({
      where: {
        assetId,
        status: { not: 'CANCELLED' },
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        bookedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * PATCH /bookings/:id/cancel — Cancel an existing booking.
   */
  async cancel(id: string, userId: string) {
    const booking = await this.prisma.resourceBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking with ID ${id} not found`);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (booking.bookedById !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    return this.prisma.resourceBooking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
