import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FormDataService } from './form-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('form-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormDataController {
  constructor(private readonly formDataService: FormDataService) {}

  @Post(':formId')
  @HttpCode(HttpStatus.CREATED)
  async createFormData(
    @Param('formId') formId: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.formDataService.createFormData(formId, data, req.user.id);
  }

  @Get(':formId')
  async getFormData(
    @Param('formId') formId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ) {
    // Remove pagination params from filters
    const { page: _, limit: __, ...cleanFilters } = filters;
    
    return this.formDataService.getFormData(
      formId,
      Number(page),
      Number(limit),
      cleanFilters,
    );
  }

  @Get(':formId/:recordId')
  async getFormDataById(
    @Param('formId') formId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.formDataService.getFormDataById(formId, recordId);
  }

  @Put(':formId/:recordId')
  async updateFormData(
    @Param('formId') formId: string,
    @Param('recordId') recordId: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.formDataService.updateFormData(formId, recordId, data, req.user.id);
  }

  @Delete(':formId/:recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFormData(
    @Param('formId') formId: string,
    @Param('recordId') recordId: string,
  ) {
    await this.formDataService.deleteFormData(formId, recordId);
  }

  @Get(':formId/export/:format')
  async exportFormData(
    @Param('formId') formId: string,
    @Param('format') format: 'csv' | 'json',
    @Res() res: Response,
  ) {
    const data = await this.formDataService.exportFormData(formId, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="form-data-${formId}.csv"`);
      res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="form-data-${formId}.json"`);
      res.json(data);
    }
  }

  @Post(':formId/bulk')
  @Roles('Administrator')
  async bulkCreateFormData(
    @Param('formId') formId: string,
    @Body() data: { records: any[] },
    @Request() req,
  ) {
    const results = [];
    
    for (const record of data.records) {
      try {
        const result = await this.formDataService.createFormData(formId, record, req.user.id);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message, data: record });
      }
    }

    return {
      total: data.records.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  @Delete(':formId/bulk')
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkDeleteFormData(
    @Param('formId') formId: string,
    @Body() data: { recordIds: string[] },
  ) {
    const results = [];
    
    for (const recordId of data.recordIds) {
      try {
        await this.formDataService.deleteFormData(formId, recordId);
        results.push({ success: true, recordId });
      } catch (error) {
        results.push({ success: false, error: error.message, recordId });
      }
    }

    return {
      total: data.recordIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}