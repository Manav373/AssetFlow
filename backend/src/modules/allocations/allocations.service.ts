/**
 * @module Allocations
 * @description Service handling asset checkout workflow with Single Holder Guard,
 *              active allocation queries, and return processing.
 * @authors Developer 2
 * @status Completed
 * @collaboration AllocationsController, AssetsService (status updates).
 *                Frontend Developer D consumes GET /allocations for dashboard.
 */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
export class AllocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  /**
   * Allocates an asset to a user.
   * Single Holder Guard: rejects with 409 if the asset already has an ACTIVE allocation.
   */
  async create(dto: CreateAllocationDto) {
    const { assetId, allocatedToId, expectedReturnDate } = dto;

    // Verify asset exists
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Verify target user exists
    const user = await this.prisma.user.findUnique({
      where: { id: allocatedToId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${allocatedToId} not found`);
    }

    // --- Single Holder Guard ---
    const activeAllocation = await this.prisma.assetAllocation.findFirst({
      where: { assetId, status: 'ACTIVE' },
      include: {
        allocatedTo: { select: { firstName: true, lastName: true } },
      },
    });
    if (activeAllocation) {
      const holder = activeAllocation.allocatedTo;
      throw new ConflictException(
        `Asset is already allocated to ${holder.firstName} ${holder.lastName}`,
      );
    }

    // Update asset status to ALLOCATED and create allocation record (atomic transaction)
    const [allocation] = await this.prisma.$transaction([
      this.prisma.assetAllocation.create({
        data: {
          assetId,
          allocatedToId,
          status: 'ACTIVE',
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
        },
        include: {
          asset: true,
          allocatedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' },
      }),
    ]);

    this.gateway.broadcastDashboardRefresh();
    this.gateway.sendNotificationToUser(allocatedToId, {
      type: 'success',
      title: 'Asset Allocated',
      message: `Asset ${allocation.asset.name} (${allocation.asset.assetTag}) has been allocated to you.`,
    });

    return allocation;
  }

  async findAll() {
    return this.prisma.assetAllocation.findMany({
      include: {
        asset: { select: { id: true, assetTag: true, name: true, status: true } },
        allocatedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { allocationDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const allocation = await this.prisma.assetAllocation.findUnique({
      where: { id },
      include: {
        asset: true,
        allocatedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        inspection: true,
      },
    });
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }
    return allocation;
  }

  /**
   * Marks an allocation as RETURNED and sets the asset back to AVAILABLE.
   */
  async returnAsset(id: string) {
    const allocation = await this.prisma.assetAllocation.findUnique({ where: { id } });
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }
    if (allocation.status !== 'ACTIVE') {
      throw new BadRequestException(`Allocation is not active — cannot be returned`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.assetAllocation.update({
        where: { id },
        data: { status: 'RETURNED', actualReturnDate: new Date() },
      }),
      this.prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    this.gateway.broadcastDashboardRefresh();
    this.gateway.sendNotificationToUser(allocation.allocatedToId, {
      type: 'info',
      title: 'Asset Returned',
      message: `Your allocation for asset ID ${allocation.assetId} has been marked as returned.`,
    });

    return updated;
  }
}
