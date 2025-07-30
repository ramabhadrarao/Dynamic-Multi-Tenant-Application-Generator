import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../entities/report.entity';
import { ReportColumn } from '../../entities/report-column.entity';
import { ReportFilter } from '../../entities/report-filter.entity';
import { CustomReportCode } from '../../entities/custom-report-code.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateReportColumnDto } from './dto/create-report-column.dto';
import { CreateReportFilterDto } from './dto/create-report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    
    @InjectRepository(ReportColumn)
    private reportColumnsRepository: Repository<ReportColumn>,
    
    @InjectRepository(ReportFilter)
    private reportFiltersRepository: Repository<ReportFilter>,
    
    @InjectRepository(CustomReportCode)
    private customReportCodeRepository: Repository<CustomReportCode>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportsRepository.create(createReportDto);
    return await this.reportsRepository.save(report);
  }

  async findAll(appId?: string): Promise<Report[]> {
    const where = appId ? { app_id: appId } : {};
    
    return await this.reportsRepository.find({
      where,
      relations: ['application', 'form', 'columns', 'filters'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['application', 'form', 'columns', 'filters', 'customCode', 'permissions'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    
    Object.assign(report, updateReportDto);
    return await this.reportsRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportsRepository.softRemove(report);
  }

  async findByApplication(appId: string): Promise<Report[]> {
    return this.findAll(appId);
  }

  async createColumn(reportId: string, createReportColumnDto: CreateReportColumnDto): Promise<ReportColumn> {
    const report = await this.findOne(reportId);
    
    const column = this.reportColumnsRepository.create({
      ...createReportColumnDto,
      report_id: reportId,
    });

    return await this.reportColumnsRepository.save(column);
  }

  async updateColumn(columnId: string, updateData: Partial<CreateReportColumnDto>): Promise<ReportColumn> {
    const column = await this.reportColumnsRepository.findOne({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Report column not found');
    }

    Object.assign(column, updateData);
    return await this.reportColumnsRepository.save(column);
  }

  async removeColumn(columnId: string): Promise<void> {
    const column = await this.reportColumnsRepository.findOne({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Report column not found');
    }

    await this.reportColumnsRepository.remove(column);
  }

  async createFilter(reportId: string, createReportFilterDto: CreateReportFilterDto): Promise<ReportFilter> {
    const report = await this.findOne(reportId);
    
    const filter = this.reportFiltersRepository.create({
      ...createReportFilterDto,
      report_id: reportId,
    });

    return await this.reportFiltersRepository.save(filter);
  }

  async updateFilter(filterId: string, updateData: Partial<CreateReportFilterDto>): Promise<ReportFilter> {
    const filter = await this.reportFiltersRepository.findOne({
      where: { id: filterId },
    });

    if (!filter) {
      throw new NotFoundException('Report filter not found');
    }

    Object.assign(filter, updateData);
    return await this.reportFiltersRepository.save(filter);
  }

  async removeFilter(filterId: string): Promise<void> {
    const filter = await this.reportFiltersRepository.findOne({
      where: { id: filterId },
    });

    if (!filter) {
      throw new NotFoundException('Report filter not found');
    }

    await this.reportFiltersRepository.remove(filter);
  }

  async updateCustomCode(reportId: string, sqlQuery?: string, backendCode?: string): Promise<CustomReportCode> {
    let customCode = await this.customReportCodeRepository.findOne({
      where: { report_id: reportId },
    });

    if (!customCode) {
      customCode = this.customReportCodeRepository.create({
        report_id: reportId,
        sql_query: sqlQuery,
        backend_code: backendCode,
      });
    } else {
      if (sqlQuery !== undefined) customCode.sql_query = sqlQuery;
      if (backendCode !== undefined) customCode.backend_code = backendCode;
    }

    return await this.customReportCodeRepository.save(customCode);
  }
}