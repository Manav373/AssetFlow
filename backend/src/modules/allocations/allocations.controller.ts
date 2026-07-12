/**
 * @module Allocations
 * @description REST controller exposing asset checkout and return endpoints.
 * @authors Developer 2
 * @status Completed
 * @collaboration Frontend Developer D consumes POST /allocations for checkout form.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('allocations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  /** POST /allocations — Checkout an asset to a user (ADMIN or ASSET_MANAGER) */
  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  create(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.create(createAllocationDto);
  }

  /** GET /allocations — List all allocations */
  @Get()
  findAll() {
    return this.allocationsService.findAll();
  }

  /** GET /allocations/:id — Get a single allocation by ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationsService.findOne(id);
  }

  /** PATCH /allocations/:id/return — Mark allocation as returned, asset as AVAILABLE */
  @Patch(':id/return')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  returnAsset(@Param('id') id: string) {
    return this.allocationsService.returnAsset(id);
  }
}
