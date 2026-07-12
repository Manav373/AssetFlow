/**
 * @module Assets
 * @description Assets registry management service handling registration, sequential tagging, and paginated searches.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Consumed by AssetsController and queried by allocations/bookings/maintenance services.
 */

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    const {
      name,
      serialNumber,
      categoryId,
      locationId,
      departmentId,
      status,
      condition,
      acquisitionCost,
      isBookable,
      warrantyEndDate,
    } = createAssetDto;

    // Check if category exists
    const category = await this.prisma.assetCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`AssetCategory with ID ${categoryId} not found`);
    }

    // Check if serial number is unique (if provided)
    if (serialNumber) {
      const existingSerial = await this.prisma.asset.findUnique({
        where: { serialNumber },
      });
      if (existingSerial) {
        throw new ConflictException(`Asset with serial number ${serialNumber} already exists`);
      }
    }

    // Generate sequential assetTag: AF-XXXX
    const lastAsset = await this.prisma.asset.findFirst({
      orderBy: { assetTag: 'desc' },
    });

    let nextNum = 1;
    if (lastAsset) {
      const match = lastAsset.assetTag.match(/^AF-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const assetTag = `AF-${String(nextNum).padStart(4, '0')}`;

    return this.prisma.asset.create({
      data: {
        assetTag,
        name,
        serialNumber,
        categoryId,
        locationId,
        departmentId,
        status: status ?? 'AVAILABLE',
        condition: condition ?? 'NEW',
        acquisitionCost,
        isBookable: isBookable ?? false,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
      },
      include: {
        category: true,
        location: true,
        department: true,
      },
    });
  }

  async findAll(query: {
    search?: string;
    categoryId?: string;
    locationId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.locationId) {
      where.locationId = query.locationId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { assetTag: { contains: query.search } },
        { name: { contains: query.search } },
        { serialNumber: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assetTag: 'asc' },
        include: {
          category: true,
          location: true,
          department: true,
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              allocatedTo: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        department: true,
        allocations: {
          include: {
            allocatedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }
}
