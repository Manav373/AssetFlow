/**
 * @module Audits
 * @description DTO for creating a new audit cycle with PLANNED or IN_PROGRESS status.
 * @authors Developer 2
 * @status Completed
 */

import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { AuditStatus } from '@prisma/client';

export class CreateAuditCycleDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;
}
