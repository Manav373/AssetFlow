import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Asset ID is required' })
  assetId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsOptional()
  priority?: string;
}
