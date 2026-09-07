import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoleCompetencyItemDto {
  @IsNumber()
  competencyId: number;

  @IsNumber()
  @Min(0, { message: 'Required score must be at least 0' })
  @Max(100, { message: 'Required score cannot exceed 100' })
  requiredScore: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1, { message: 'Priority weight must be at least 0.1' })
  @Max(5.0, { message: 'Priority weight cannot exceed 5.0' })
  priorityWeight?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumScore?: number;

  @IsOptional()
  @IsString()
  sourceReference?: string;
}

export class UpdateRoleCompetenciesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleCompetencyItemDto)
  requirements: RoleCompetencyItemDto[];
}
