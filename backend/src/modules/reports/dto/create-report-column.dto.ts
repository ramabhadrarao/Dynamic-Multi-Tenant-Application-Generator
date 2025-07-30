import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateReportColumnDto {
  @IsString()
  @IsNotEmpty()
  column_name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  @IsOptional()
  is_calculated?: boolean = false;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number = 0;

  @IsString()
  @IsOptional()
  sort_direction?: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean = true;
}