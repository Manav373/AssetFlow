/**
 * @module Audits
 * @description REST controller for audit cycle management, auditor assignments, and asset verifications.
 * @authors Developer 2
 * @status Completed
 * @collaboration Frontend Developer D for audit dashboard and verification checklist UI.
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
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditsService } from './audits.service';
import { CreateAuditCycleDto } from './dto/create-audit-cycle.dto';
import { CreateAuditAssignmentDto } from './dto/create-audit-assignment.dto';
import { CreateAuditVerificationDto } from './dto/create-audit-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  // ─────────────────────────────────────────────
  // Audit Cycles
  // ─────────────────────────────────────────────

  /** POST /audits/cycles — Create a new audit cycle (ADMIN or ASSET_MANAGER) */
  @Post('cycles')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  createCycle(@Body() dto: CreateAuditCycleDto) {
    return this.auditsService.createCycle(dto);
  }

  /** GET /audits/cycles — List all audit cycles */
  @Get('cycles')
  findAllCycles() {
    return this.auditsService.findAllCycles();
  }

  /** GET /audits/cycles/:id — Get a single audit cycle with all assignments and verifications */
  @Get('cycles/:id')
  findOneCycle(@Param('id') id: string) {
    return this.auditsService.findOneCycle(id);
  }

  /**
   * PATCH /audits/cycles/:id/lock — Lock the cycle (ADMIN or ASSET_MANAGER).
   * Sets isLocked = true and status = COMPLETED. Prevents further changes.
   */
  @Patch('cycles/:id/lock')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  lockCycle(@Param('id') id: string) {
    return this.auditsService.lockCycle(id);
  }

  // ─────────────────────────────────────────────
  // Audit Assignments
  // ─────────────────────────────────────────────

  /**
   * POST /audits/assignments — Assign auditor to a scope (dept/location) within a cycle.
   * Restricted to ADMIN or ASSET_MANAGER.
   */
  @Post('assignments')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  createAssignment(@Body() dto: CreateAuditAssignmentDto) {
    return this.auditsService.createAssignment(dto);
  }

  /** GET /audits/assignments — List all assignments, optionally filter by cycleId */
  @Get('assignments')
  findAllAssignments(@Query('cycleId') cycleId?: string) {
    return this.auditsService.findAllAssignments(cycleId);
  }

  // ─────────────────────────────────────────────
  // Audit Verifications
  // ─────────────────────────────────────────────

  /**
   * POST /audits/verifications — Auditor records physical verification result.
   * Status values: VERIFIED | MISSING | DAMAGED
   */
  @Post('verifications')
  createVerification(@Body() dto: CreateAuditVerificationDto) {
    return this.auditsService.createVerification(dto);
  }

  /** GET /audits/verifications — List all verifications, optionally filter by assignmentId */
  @Get('verifications')
  findAllVerifications(@Query('assignmentId') assignmentId?: string) {
    return this.auditsService.findAllVerifications(assignmentId);
  }
}
