import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateFieldPermissionDto {
  @IsUUID()
  role_id: string;

  @IsUUID()
  form_id: string;

  @IsUUID()
  field_id: string;

  @IsBoolean()
  @IsOptional()
  can_view?: boolean = true;

  @IsBoolean()
  @IsOptional()
  can_edit?: boolean = true;

  @IsBoolean()
  @IsOptional()
  is_required?: boolean = false;
}