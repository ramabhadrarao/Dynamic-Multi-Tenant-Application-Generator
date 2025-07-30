import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DynamicTablesService } from './dynamic-tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dynamic-tables')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator')
export class DynamicTablesController {
  constructor(private readonly dynamicTablesService: DynamicTablesService) {}

  @Post('form/:formId/create')
  @HttpCode(HttpStatus.CREATED)
  async createTableForForm(@Param('formId') formId: string) {
    await this.dynamicTablesService.createTableForForm(formId);
    return { message: 'Table created successfully' };
  }

  @Post('form/:formId/update')
  async updateTableForForm(@Param('formId') formId: string) {
    await this.dynamicTablesService.updateTableForForm(formId);
    return { message: 'Table updated successfully' };
  }

  @Delete('form/:formId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async dropTableForForm(@Param('formId') formId: string) {
    await this.dynamicTablesService.dropTableForForm(formId);
  }

  @Get('structure/:tableName')
  async getTableStructure(@Param('tableName') tableName: string) {
    return this.dynamicTablesService.getTableStructure(tableName);
  }

  @Get('list')
  async listTables() {
    const tables = await this.dynamicTablesService.listTables();
    return { tables };
  }
}