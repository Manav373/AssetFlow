/**
 * @module Assets
 * @description Controller exposing endpoints for asset registration and search query retrieval.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Consumed by Frontend Developer 3 for /assets table directory list and /assets/new form.
 */

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: string,
    @Query('isBookable') isBookable?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.assetsService.findAll({
      search,
      categoryId,
      locationId,
      status,
      isBookable,
      page,
      limit,
    });
  }

  @Get('locations')
  findLocations() {
    return this.assetsService.findLocations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }
}
