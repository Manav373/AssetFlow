import { IsBoolean, IsDateString, IsEnum, IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssetStatus, AssetCondition } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty({ message: 'Asset name is required' })
  name: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @IsBoolean()
  @IsOptional()
  isBookable?: boolean;

  @IsDateString()
  @IsOptional()
  warrantyEndDate?: string;
}
