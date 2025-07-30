import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateReportColumnDto } from './dto/create-report-column.dto';
import { CreateReportFilterDto } from './dto/create-report-filter.dto';
import { UpdateCustomReportCodeDto } from './dto/update-custom-report-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  findAll(@Query('app_id') appId?: string) {
    return this.reportsService.findAll(appId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  @Get('application/:appId')
  findByApplication(@Param('appId') appId: string) {
    return this.reportsService.findByApplication(appId);
  }

  @Post(':id/columns')
  createColumn(@Param('id') reportId: string, @Body() createReportColumnDto: CreateReportColumnDto) {
    return this.reportsService.createColumn(reportId, createReportColumnDto);
  }

  @Patch('columns/:columnId')
  updateColumn(@Param('columnId') columnId: string, @Body() updateData: Partial<CreateReportColumnDto>) {
    return this.reportsService.updateColumn(columnId, updateData);
  }

  @Delete('columns/:columnId')
  removeColumn(@Param('columnId') columnId: string) {
    return this.reportsService.removeColumn(columnId);
  }

  @Post(':id/filters')
  createFilter(@Param('id') reportId: string, @Body() createReportFilterDto: CreateReportFilterDto) {
    return this.reportsService.createFilter(reportId, createReportFilterDto);
  }

  @Patch('filters/:filterId')
  updateFilter(@Param('filterId') filterId: string, @Body() updateData: Partial<CreateReportFilterDto>) {
    return this.reportsService.updateFilter(filterId, updateData);
  }

  @Delete('filters/:filterId')
  removeFilter(@Param('filterId') filterId: string) {
    return this.reportsService.removeFilter(filterId);
  }

  @Patch(':id/custom-code')
  updateCustomCode(@Param('id') reportId: string, @Body() updateCustomReportCodeDto: UpdateCustomReportCodeDto) {
    return this.reportsService.updateCustomCode(
      reportId,
      updateCustomReportCodeDto.sql_query,
      updateCustomReportCodeDto.backend_code
    );
  }
}