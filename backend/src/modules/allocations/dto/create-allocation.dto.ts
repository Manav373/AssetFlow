/**
 * @module Allocations
 * @description Data Transfer Object for creating a new asset allocation record.
 * @authors Developer 2
 * @status Completed
 * @collaboration Consumed by AllocationsController POST /allocations endpoint.
 */

import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  assetId: string;

  @IsString()
  allocatedToId: string;

  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string;
}
