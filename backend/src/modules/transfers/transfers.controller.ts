/**
 * @module Transfers
 * @description REST controller for the multi-stage department transfer approval workflow.
 * @authors Developer 2
 * @status Completed
 * @collaboration Frontend Developer D consumes transfer list for approval workflow UI.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  /** POST /transfers — Create a new transfer request (any authenticated user) */
  @Post()
  create(@Body() createTransferDto: CreateTransferDto, @Req() req: any) {
    return this.transfersService.create(createTransferDto, req.user.id);
  }

  /** GET /transfers — List all transfer requests */
  @Get()
  findAll() {
    return this.transfersService.findAll();
  }

  /** GET /transfers/:id — Get single transfer request */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  /**
   * PATCH /transfers/:id/dept-approve
   * Restricted to DEPARTMENT_HEAD or ADMIN.
   * Advances status: REQUESTED → DEPT_HEAD_APPROVED
   */
  @Patch(':id/dept-approve')
  @Roles(Role.DEPARTMENT_HEAD, Role.ADMIN)
  deptApprove(@Param('id') id: string) {
    return this.transfersService.deptApprove(id);
  }

  /**
   * PATCH /transfers/:id/manager-approve
   * Restricted to ASSET_MANAGER or ADMIN.
   * Advances status: DEPT_HEAD_APPROVED → TRANSFERRED.
   * Updates asset departmentId and active allocation holder.
   */
  @Patch(':id/manager-approve')
  @Roles(Role.ASSET_MANAGER, Role.ADMIN)
  managerApprove(@Param('id') id: string) {
    return this.transfersService.managerApprove(id);
  }

  /** PATCH /transfers/:id/cancel — Cancel a pending transfer (requester only) */
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.transfersService.cancel(id, req.user.id);
  }
}
