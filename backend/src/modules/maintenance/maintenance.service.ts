import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async create(dto: CreateMaintenanceDto, requestedById: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException(`Asset with ID ${dto.assetId} not found`);

    const ticket = await this.prisma.maintenanceRequest.create({
      data: {
        assetId: dto.assetId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'Medium',
        requestedById,
        status: 'RAISED',
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify all clients to refresh lists
    this.gateway.broadcastDashboardRefresh();

    return ticket;
  }

  async findAll() {
    return this.prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { id: true, assetTag: true, name: true, status: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!ticket) throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    return ticket;
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    const ticket = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Maintenance request with ID ${id} not found`);

    const updateData: any = { ...dto };
    if (dto.status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notify all clients to refresh lists
    this.gateway.broadcastDashboardRefresh();

    return updated;
  }
}
