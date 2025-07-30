import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { UserRolePermission } from '../../entities/user-role-permission.entity';
import { FieldPermission } from '../../entities/field-permission.entity';
import { ReportPermission } from '../../entities/report-permission.entity';
import { Role } from '../../entities/role.entity';
import { Form } from '../../entities/form.entity';
import { FormField } from '../../entities/form-field.entity';
import { Report } from '../../entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRolePermission, FieldPermission, ReportPermission, Role, Form, FormField, Report])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}