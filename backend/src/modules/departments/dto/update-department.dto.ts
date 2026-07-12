import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  headId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
