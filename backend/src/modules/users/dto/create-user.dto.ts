import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsUUID()
  app_id: string;

  @IsUUID()
  @IsOptional()
  role_id?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}