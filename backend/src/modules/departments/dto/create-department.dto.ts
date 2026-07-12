import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Department name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Department code is required' })
  code: string;

  @IsString()
  @IsOptional()
  headId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
