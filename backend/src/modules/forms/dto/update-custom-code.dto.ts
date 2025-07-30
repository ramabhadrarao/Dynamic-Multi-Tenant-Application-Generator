import { IsString, IsOptional } from 'class-validator';

export class UpdateCustomCodeDto {
  @IsString()
  @IsOptional()
  frontend_code?: string;

  @IsString()
  @IsOptional()
  backend_code?: string;

  @IsString()
  @IsOptional()
  css_code?: string;
}