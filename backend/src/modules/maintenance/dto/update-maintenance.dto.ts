import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsOptional()
  assignedToId?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;
}
