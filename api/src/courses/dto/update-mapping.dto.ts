import { IsOptional, IsEnum, IsInt, IsString, IsNumber, Min, Max } from 'class-validator';
import { MappingStatus, MappingMethod } from '../types/course.types';

export class UpdateCourseMappingDto {
  @IsOptional()
  @IsEnum(MappingStatus)
  status?: MappingStatus;

  @IsOptional()
  @IsInt()
  overrideCompetencyId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  relevanceScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
