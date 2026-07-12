/**
 * @module Audits
 * @description DTO for assigning an auditor to a specific department or location scope within a cycle.
 * @authors Developer 2
 * @status Completed
 */

import { IsString, IsOptional } from 'class-validator';

export class CreateAuditAssignmentDto {
  @IsString()
  cycleId: string;

  @IsString()
  auditorId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;
}
