import { IsInt, IsNotEmpty } from 'class-validator';

export class StartDiagnosticDto {
  @IsInt()
  @IsNotEmpty({ message: 'Competency ID is required' })
  competencyId: number;
}
