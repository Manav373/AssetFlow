/**
 * @module Departments
 * @description Company departments service managing CRUD logic and uniqueness validation.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Consumed by DepartmentsController and used by other services for department checks.
 */

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, code, headId, isActive } = createDepartmentDto;

    // Check code unique
    const existingCode = await this.prisma.department.findUnique({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException(`Department code ${code} is already in use`);
    }

    // Check name unique
    const existingName = await this.prisma.department.findUnique({
      where: { name },
    });
    if (existingName) {
      throw new ConflictException(`Department name ${name} is already in use`);
    }

    return this.prisma.department.create({
      data: {
        name,
        code,
        headId,
        isActive: isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return dept;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const dept = await this.findOne(id);

    if (updateDepartmentDto.code && updateDepartmentDto.code !== dept.code) {
      const existingCode = await this.prisma.department.findUnique({
        where: { code: updateDepartmentDto.code },
      });
      if (existingCode) {
        throw new ConflictException(`Department code ${updateDepartmentDto.code} is already in use`);
      }
    }

    if (updateDepartmentDto.name && updateDepartmentDto.name !== dept.name) {
      const existingName = await this.prisma.department.findUnique({
        where: { name: updateDepartmentDto.name },
      });
      if (existingName) {
        throw new ConflictException(`Department name ${updateDepartmentDto.name} is already in use`);
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.department.delete({
      where: { id },
    });
    return { success: true, message: `Department deleted successfully` };
  }
}
