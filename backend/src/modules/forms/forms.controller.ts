import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { UpdateCustomCodeDto } from './dto/update-custom-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll(@Query('app_id') appId?: string) {
    return this.formsService.findAll(appId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }

  @Get('application/:appId')
  findByApplication(@Param('appId') appId: string) {
    return this.formsService.findByApplication(appId);
  }

  @Post(':id/fields')
  createField(@Param('id') formId: string, @Body() createFormFieldDto: CreateFormFieldDto) {
    return this.formsService.createField(formId, createFormFieldDto);
  }

  @Get(':id/fields')
  getFormFields(@Param('id') formId: string) {
    return this.formsService.getFormFields(formId);
  }

  @Patch('fields/:fieldId')
  updateField(@Param('fieldId') fieldId: string, @Body() updateFormFieldDto: UpdateFormFieldDto) {
    return this.formsService.updateField(fieldId, updateFormFieldDto);
  }

  @Delete('fields/:fieldId')
  removeField(@Param('fieldId') fieldId: string) {
    return this.formsService.removeField(fieldId);
  }

  @Patch(':id/custom-code')
  updateCustomCode(@Param('id') formId: string, @Body() updateCustomCodeDto: UpdateCustomCodeDto) {
    return this.formsService.updateCustomCode(
      formId,
      updateCustomCodeDto.frontend_code,
      updateCustomCodeDto.backend_code,
      updateCustomCodeDto.css_code
    );
  }
}