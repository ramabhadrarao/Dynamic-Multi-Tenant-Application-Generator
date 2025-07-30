import { IsString, IsOptional } from 'class-validator';

export class UpdateCustomReportCodeDto {
  @IsString()
  @IsOptional()
  sql_query?: string;

  @IsString()
  @IsOptional()
  backend_code?: string;
}