/**
 * @module Transfers
 * @description Service managing the multi-stage transfer approval pipeline:
 *              REQUESTED → DEPT_HEAD_APPROVED → TRANSFERRED.
 *              Final manager approval updates asset status and active allocation holder.
 * @authors Developer 2
 * @status Completed
 * @collaboration TransfersController; AllocationsService (via PrismaService shared client).
 *                Coordinate with Developer A for shared Prisma client usage.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}

  /**
   * POST /transfers — Create a new transfer request (status: REQUESTED).
   */
  async create(dto: CreateTransferDto, requestedById: string) {
    const { assetId, targetDeptId } = dto;

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset with ID ${assetId} not found`);

    const dept = await this.prisma.department.findUnique({ where: { id: targetDeptId } });
    if (!dept) throw new NotFoundException(`Department with ID ${targetDeptId} not found`);

    // Prevent duplicate open requests for the same asset
    const existing = await this.prisma.transferRequest.findFirst({
      where: {
        assetId,
        status: { in: ['REQUESTED', 'DEPT_HEAD_APPROVED'] },
      },
    });
    if (existing) {
      throw new BadRequestException(
        `A transfer request for this asset is already pending approval`,
      );
    }

    return this.prisma.transferRequest.create({
      data: {
        assetId,
        targetDeptId,
        requestedById,
        status: 'REQUESTED',
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        targetDept: true,
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.transferRequest.findMany({
      include: {
        asset: { select: { id: true, assetTag: true, name: true, status: true } },
        targetDept: true,
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        targetDept: true,
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!transfer) throw new NotFoundException(`Transfer request with ID ${id} not found`);
    return transfer;
  }

  /**
   * PATCH /transfers/:id/dept-approve — Department Head or Admin approves.
   * Status: REQUESTED → DEPT_HEAD_APPROVED
   */
  async deptApprove(id: string) {
    const transfer = await this.prisma.transferRequest.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException(`Transfer request with ID ${id} not found`);

    if (transfer.status !== 'REQUESTED') {
      throw new BadRequestException(
        `Transfer must be in REQUESTED status to receive department approval. Current status: ${transfer.status}`,
      );
    }

    return this.prisma.transferRequest.update({
      where: { id },
      data: { status: 'DEPT_HEAD_APPROVED' },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        targetDept: true,
      },
    });
  }

  /**
   * PATCH /transfers/:id/manager-approve — Asset Manager or Admin approves.
   * Status: DEPT_HEAD_APPROVED → TRANSFERRED.
   * Also updates Asset.departmentId and marks any ACTIVE allocation as TRANSFERRED.
   */
  async managerApprove(id: string) {
    const transfer = await this.prisma.transferRequest.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException(`Transfer request with ID ${id} not found`);

    if (transfer.status !== 'DEPT_HEAD_APPROVED') {
      throw new BadRequestException(
        `Transfer must be in DEPT_HEAD_APPROVED status for manager approval. Current status: ${transfer.status}`,
      );
    }

    // Run all updates atomically
    const [updatedTransfer] = await this.prisma.$transaction([
      // 1. Mark transfer as TRANSFERRED
      this.prisma.transferRequest.update({
        where: { id },
        data: { status: 'TRANSFERRED' },
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
          targetDept: true,
        },
      }),
      // 2. Move asset to the new department
      this.prisma.asset.update({
        where: { id: transfer.assetId },
        data: { departmentId: transfer.targetDeptId },
      }),
      // 3. Mark any ACTIVE allocation as TRANSFERRED
      this.prisma.assetAllocation.updateMany({
        where: { assetId: transfer.assetId, status: 'ACTIVE' },
        data: { status: 'TRANSFERRED' },
      }),
    ]);

    return updatedTransfer;
  }

  /**
   * PATCH /transfers/:id/cancel — Cancel a pending transfer request.
   */
  async cancel(id: string, userId: string) {
    const transfer = await this.prisma.transferRequest.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException(`Transfer request with ID ${id} not found`);

    if (transfer.status === 'TRANSFERRED' || transfer.status === 'CANCELLED') {
      throw new BadRequestException(`Transfer is already ${transfer.status} and cannot be cancelled`);
    }

    // Only the requester or an admin/manager can cancel
    if (transfer.requestedById !== userId) {
      throw new ForbiddenException(`Only the requester can cancel this transfer`);
    }

    return this.prisma.transferRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
