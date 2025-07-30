import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreateFormPermissionDto } from './dto/create-form-permission.dto';
import { CreateFieldPermissionDto } from './dto/create-field-permission.dto';
import { CreateReportPermissionDto } from './dto/create-report-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('forms')
  createFormPermission(@Body() createFormPermissionDto: CreateFormPermissionDto, @Request() req) {
    return this.permissionsService.createFormPermission(createFormPermissionDto, req.user.id);
  }

  @Post('fields')
  createFieldPermission(@Body() createFieldPermissionDto: CreateFieldPermissionDto) {
    return this.permissionsService.createFieldPermission(createFieldPermissionDto);
  }

  @Post('reports')
  createReportPermission(@Body() createReportPermissionDto: CreateReportPermissionDto) {
    return this.permissionsService.createReportPermission(createReportPermissionDto);
  }

  @Get('forms/role/:roleId')
  getFormPermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getFormPermissions(roleId);
  }

  @Get('fields/role/:roleId')
  getFieldPermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getFieldPermissions(roleId);
  }

  @Get('fields/role/:roleId/form/:formId')
  getFieldPermissionsByForm(@Param('roleId') roleId: string, @Param('formId') formId: string) {
    return this.permissionsService.getFieldPermissions(roleId, formId);
  }

  @Get('reports/role/:roleId')
  getReportPermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getReportPermissions(roleId);
  }

  @Delete('forms/role/:roleId/form/:formId')
  removeFormPermission(@Param('roleId') roleId: string, @Param('formId') formId: string) {
    return this.permissionsService.removeFormPermission(roleId, formId);
  }

  @Delete('fields/role/:roleId/form/:formId/field/:fieldId')
  removeFieldPermission(
    @Param('roleId') roleId: string,
    @Param('formId') formId: string,
    @Param('fieldId') fieldId: string
  ) {
    return this.permissionsService.removeFieldPermission(roleId, formId, fieldId);
  }

  @Delete('reports/role/:roleId/report/:reportId')
  removeReportPermission(@Param('roleId') roleId: string, @Param('reportId') reportId: string) {
    return this.permissionsService.removeReportPermission(roleId, reportId);
  }
}