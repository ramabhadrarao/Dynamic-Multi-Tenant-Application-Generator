import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from '../../entities/report.entity';
import { ReportColumn } from '../../entities/report-column.entity';
import { ReportFilter } from '../../entities/report-filter.entity';
import { CustomReportCode } from '../../entities/custom-report-code.entity';
import { Form } from '../../entities/form.entity';
import { Application } from '../../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportColumn, ReportFilter, CustomReportCode, Form, Application])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}