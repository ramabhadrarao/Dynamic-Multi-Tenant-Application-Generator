import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateReportFilterDto {
  @IsString()
  @IsNotEmpty()
  field_name: string;

  @IsString()
  @IsNotEmpty()
  filter_type: string;

  @IsString()
  @IsOptional()
  options?: string;

  @IsString()
  @IsOptional()
  default_value?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean = false;
}