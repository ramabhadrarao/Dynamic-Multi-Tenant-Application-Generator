import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateReportPermissionDto {
  @IsUUID()
  role_id: string;

  @IsUUID()
  report_id: string;

  @IsBoolean()
  @IsOptional()
  can_view?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_filter?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_export?: boolean = false;
}