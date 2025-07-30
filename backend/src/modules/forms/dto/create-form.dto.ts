import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_custom?: boolean = false;

  @IsUUID()
  @IsOptional()
  parent_form_id?: string;

  @IsUUID()
  app_id: string;

  @IsString()
  @IsOptional()
  table_name?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}