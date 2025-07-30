import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { ReportType } from '../../../entities/report.entity';

export class CreateReportDto {
  @IsUUID()
  form_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType = ReportType.BUILDER;

  @IsUUID()
  app_id: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}