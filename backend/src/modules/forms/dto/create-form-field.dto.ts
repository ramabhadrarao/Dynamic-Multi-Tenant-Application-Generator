import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { FieldType } from '../../../entities/form-field.entity';

export class CreateFormFieldDto {
  @IsString()
  @IsNotEmpty()
  field_name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(FieldType)
  field_type: FieldType;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsString()
  @IsOptional()
  default_value?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @IsBoolean()
  @IsOptional()
  readonly?: boolean = false;

  @IsBoolean()
  @IsOptional()
  visible?: boolean = true;

  @IsInt()
  @IsOptional()
  order_index?: number = 0;

  @IsString()
  @IsOptional()
  show_if?: string;

  @IsString()
  @IsOptional()
  hide_if?: string;

  @IsString()
  @IsOptional()
  filter_by_field?: string;

  @IsBoolean()
  @IsOptional()
  is_lookup?: boolean = false;

  @IsString()
  @IsOptional()
  lookup_table?: string;

  @IsString()
  @IsOptional()
  lookup_key?: string;

  @IsString()
  @IsOptional()
  lookup_label?: string;

  @IsString()
  @IsOptional()
  validation_rules?: string;

  @IsString()
  @IsOptional()
  options?: string;
}