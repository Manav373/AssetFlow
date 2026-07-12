/**
 * @module Transfers
 * @description DTO for creating a new transfer request between departments.
 * @authors Developer 2
 * @status Completed
 * @collaboration Consumed by TransfersController POST /transfers endpoint.
 */

import { IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  assetId: string;

  @IsString()
  targetDeptId: string;
}
