import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRolePermission } from '../../entities/user-role-permission.entity';
import { FieldPermission } from '../../entities/field-permission.entity';
import { ReportPermission } from '../../entities/report-permission.entity';
import { CreateFormPermissionDto } from './dto/create-form-permission.dto';
import { CreateFieldPermissionDto } from './dto/create-field-permission.dto';
import { CreateReportPermissionDto } from './dto/create-report-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(UserRolePermission)
    private userRolePermissionsRepository: Repository<UserRolePermission>,
    
    @InjectRepository(FieldPermission)
    private fieldPermissionsRepository: Repository<FieldPermission>,
    
    @InjectRepository(ReportPermission)
    private reportPermissionsRepository: Repository<ReportPermission>,
  ) {}

  async createFormPermission(createFormPermissionDto: CreateFormPermissionDto, assignedBy: string): Promise<UserRolePermission> {
    const existingPermission = await this.userRolePermissionsRepository.findOne({
      where: {
        role_id: createFormPermissionDto.role_id,
        form_id: createFormPermissionDto.form_id,
      },
    });

    if (existingPermission) {
      Object.assign(existingPermission, createFormPermissionDto);
      existingPermission.assigned_by = assignedBy;
      return await this.userRolePermissionsRepository.save(existingPermission);
    }

    const permission = this.userRolePermissionsRepository.create({
      ...createFormPermissionDto,
      assigned_by: assignedBy,
    });

    return await this.userRolePermissionsRepository.save(permission);
  }

  async createFieldPermission(createFieldPermissionDto: CreateFieldPermissionDto): Promise<FieldPermission> {
    const existingPermission = await this.fieldPermissionsRepository.findOne({
      where: {
        role_id: createFieldPermissionDto.role_id,
        form_id: createFieldPermissionDto.form_id,
        field_id: createFieldPermissionDto.field_id,
      },
    });

    if (existingPermission) {
      Object.assign(existingPermission, createFieldPermissionDto);
      return await this.fieldPermissionsRepository.save(existingPermission);
    }

    const permission = this.fieldPermissionsRepository.create(createFieldPermissionDto);
    return await this.fieldPermissionsRepository.save(permission);
  }

  async createReportPermission(createReportPermissionDto: CreateReportPermissionDto): Promise<ReportPermission> {
    const existingPermission = await this.reportPermissionsRepository.findOne({
      where: {
        role_id: createReportPermissionDto.role_id,
        report_id: createReportPermissionDto.report_id,
      },
    });

    if (existingPermission) {
      Object.assign(existingPermission, createReportPermissionDto);
      return await this.reportPermissionsRepository.save(existingPermission);
    }

    const permission = this.reportPermissionsRepository.create(createReportPermissionDto);
    return await this.reportPermissionsRepository.save(permission);
  }

  async getFormPermissions(roleId: string): Promise<UserRolePermission[]> {
    return await this.userRolePermissionsRepository.find({
      where: { role_id: roleId },
      relations: ['form', 'role'],
    });
  }

  async getFieldPermissions(roleId: string, formId?: string): Promise<FieldPermission[]> {
    const where: any = { role_id: roleId };
    if (formId) {
      where.form_id = formId;
    }

    return await this.fieldPermissionsRepository.find({
      where,
      relations: ['form', 'field', 'role'],
    });
  }

  async getReportPermissions(roleId: string): Promise<ReportPermission[]> {
    return await this.reportPermissionsRepository.find({
      where: { role_id: roleId },
      relations: ['report', 'role'],
    });
  }

  async removeFormPermission(roleId: string, formId: string): Promise<void> {
    const permission = await this.userRolePermissionsRepository.findOne({
      where: { role_id: roleId, form_id: formId },
    });

    if (!permission) {
      throw new NotFoundException('Form permission not found');
    }

    await this.userRolePermissionsRepository.remove(permission);
  }

  async removeFieldPermission(roleId: string, formId: string, fieldId: string): Promise<void> {
    const permission = await this.fieldPermissionsRepository.findOne({
      where: { role_id: roleId, form_id: formId, field_id: fieldId },
    });

    if (!permission) {
      throw new NotFoundException('Field permission not found');
    }

    await this.fieldPermissionsRepository.remove(permission);
  }

  async removeReportPermission(roleId: string, reportId: string): Promise<void> {
    const permission = await this.reportPermissionsRepository.findOne({
      where: { role_id: roleId, report_id: reportId },
    });

    if (!permission) {
      throw new NotFoundException('Report permission not found');
    }

    await this.reportPermissionsRepository.remove(permission);
  }
}