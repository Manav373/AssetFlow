/**
 * @module Audits
 * @description DTO for recording an auditor's physical asset verification result.
 *              Status options: VERIFIED, MISSING, DAMAGED.
 * @authors Developer 2
 * @status Completed
 */

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AuditVerificationStatus } from '@prisma/client';

export class CreateAuditVerificationDto {
  @IsString()
  assignmentId: string;

  @IsString()
  assetId: string;

  @IsEnum(AuditVerificationStatus)
  status: AuditVerificationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
