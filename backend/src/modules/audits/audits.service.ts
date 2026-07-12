/**
 * @module Audits
 * @description Service managing audit cycle lifecycle: creation, auditor assignment scoping,
 *              physical asset verification recording, and cycle locking.
 *              When an asset is marked DAMAGED, the asset's condition field is updated accordingly.
 * @authors Developer 2
 * @status Completed
 * @collaboration AuditsController; NotificationGateway (push cycle events to auditors).
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditCycleDto } from './dto/create-audit-cycle.dto';
import { CreateAuditAssignmentDto } from './dto/create-audit-assignment.dto';
import { CreateAuditVerificationDto } from './dto/create-audit-verification.dto';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // Audit Cycles
  // ─────────────────────────────────────────────

  /**
   * POST /audits/cycles — Create a new audit cycle (PLANNED or IN_PROGRESS).
   */
  async createCycle(dto: CreateAuditCycleDto) {
    const { name, startDate, endDate, status } = dto;
    return this.prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status ?? 'PLANNED',
      },
    });
  }

  async findAllCycles() {
    return this.prisma.auditCycle.findMany({
      include: { assignments: { include: { auditor: { select: { id: true, firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneCycle(id: string) {
    const cycle = await this.prisma.auditCycle.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            auditor: { select: { id: true, firstName: true, lastName: true } },
            department: true,
            location: true,
            verifications: {
              include: { asset: { select: { id: true, assetTag: true, name: true } } },
            },
          },
        },
      },
    });
    if (!cycle) throw new NotFoundException(`Audit cycle with ID ${id} not found`);
    return cycle;
  }

  /**
   * PATCH /audits/cycles/:id/lock — Lock the cycle (no further changes allowed).
   * Sets isLocked = true and status = COMPLETED.
   */
  async lockCycle(id: string) {
    const cycle = await this.prisma.auditCycle.findUnique({ where: { id } });
    if (!cycle) throw new NotFoundException(`Audit cycle with ID ${id} not found`);
    if (cycle.isLocked) {
      throw new BadRequestException(`Audit cycle is already locked`);
    }

    return this.prisma.auditCycle.update({
      where: { id },
      data: { isLocked: true, status: 'COMPLETED', endDate: cycle.endDate ?? new Date() },
    });
  }

  // ─────────────────────────────────────────────
  // Audit Assignments
  // ─────────────────────────────────────────────

  /**
   * POST /audits/assignments — Assign auditor to a department/location scope within a cycle.
   */
  async createAssignment(dto: CreateAuditAssignmentDto) {
    const { cycleId, auditorId, departmentId, locationId } = dto;

    const cycle = await this.prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new NotFoundException(`Audit cycle with ID ${cycleId} not found`);
    if (cycle.isLocked) {
      throw new BadRequestException(`Cannot assign auditors to a locked audit cycle`);
    }

    const auditor = await this.prisma.user.findUnique({ where: { id: auditorId } });
    if (!auditor) throw new NotFoundException(`User with ID ${auditorId} not found`);

    return this.prisma.auditAssignment.create({
      data: { cycleId, auditorId, departmentId, locationId },
      include: {
        auditor: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        location: true,
        cycle: { select: { id: true, name: true, status: true } },
      },
    });
  }

  async findAllAssignments(cycleId?: string) {
    return this.prisma.auditAssignment.findMany({
      where: cycleId ? { cycleId } : undefined,
      include: {
        auditor: { select: { id: true, firstName: true, lastName: true } },
        department: true,
        location: true,
        cycle: { select: { id: true, name: true } },
      },
    });
  }

  // ─────────────────────────────────────────────
  // Audit Verifications
  // ─────────────────────────────────────────────

  /**
   * POST /audits/verifications — Record an auditor's physical verification result.
   * If asset is marked DAMAGED, also updates the asset's condition field.
   */
  async createVerification(dto: CreateAuditVerificationDto) {
    const { assignmentId, assetId, status, notes } = dto;

    const assignment = await this.prisma.auditAssignment.findUnique({
      where: { id: assignmentId },
      include: { cycle: true },
    });
    if (!assignment) throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    if (assignment.cycle.isLocked) {
      throw new BadRequestException(`Cannot add verifications to a locked audit cycle`);
    }

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException(`Asset with ID ${assetId} not found`);

    // Check for duplicate verification in the same assignment
    const existing = await this.prisma.auditVerification.findFirst({
      where: { assignmentId, assetId },
    });
    if (existing) {
      // Update existing verification instead of duplicating
      return this.prisma.auditVerification.update({
        where: { id: existing.id },
        data: { status, notes, verifiedAt: new Date() },
        include: { asset: { select: { id: true, assetTag: true, name: true } } },
      });
    }

    const operations: any[] = [
      this.prisma.auditVerification.create({
        data: { assignmentId, assetId, status, notes, verifiedAt: new Date() },
        include: { asset: { select: { id: true, assetTag: true, name: true } } },
      }),
    ];

    // If asset is DAMAGED, update its condition field
    if (status === 'DAMAGED') {
      operations.push(
        this.prisma.asset.update({
          where: { id: assetId },
          data: { condition: 'DAMAGED' },
        }),
      );
    }

    const [verification] = await this.prisma.$transaction(operations);
    return verification;
  }

  async findAllVerifications(assignmentId?: string) {
    return this.prisma.auditVerification.findMany({
      where: assignmentId ? { assignmentId } : undefined,
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        assignment: {
          include: {
            auditor: { select: { id: true, firstName: true, lastName: true } },
            cycle: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
