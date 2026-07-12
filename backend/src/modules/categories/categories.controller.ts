/**
 * @module Categories
 * @description Controller exposing endpoint for getting hierarchical category tree configurations.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Consumed by Frontend Developer 3 for /org-setup category tab.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
