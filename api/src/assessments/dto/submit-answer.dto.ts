import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  @IsNotEmpty({ message: 'Question ID is required' })
  questionId: number;

  @IsString()
  @IsNotEmpty({ message: 'Selected option is required' })
  selectedOption: string; // e.g. "A", "B", "C", "D"

  @IsOptional()
  @IsInt()
  @Min(0)
  responseTimeMs?: number;
}
