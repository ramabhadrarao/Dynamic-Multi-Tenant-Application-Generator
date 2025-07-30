import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateFormPermissionDto {
  @IsUUID()
  role_id: string;

  @IsUUID()
  form_id: string;

  @IsBoolean()
  @IsOptional()
  can_create?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_read?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_update?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_delete?: boolean = false;

  @IsBoolean()
  @IsOptional()
  can_filter?: boolean = false;
}