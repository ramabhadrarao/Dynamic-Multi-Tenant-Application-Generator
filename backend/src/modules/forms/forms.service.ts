import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from '../../entities/form.entity';
import { FormField } from '../../entities/form-field.entity';
import { CustomFormCode } from '../../entities/custom-form-code.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private formsRepository: Repository<Form>,
    
    @InjectRepository(FormField)
    private formFieldsRepository: Repository<FormField>,
    
    @InjectRepository(CustomFormCode)
    private customFormCodeRepository: Repository<CustomFormCode>,
  ) {}

  async create(createFormDto: CreateFormDto): Promise<Form> {
    const existingForm = await this.formsRepository.findOne({
      where: { code: createFormDto.code }
    });

    if (existingForm) {
      throw new ConflictException('Form code already exists');
    }

    const form = this.formsRepository.create(createFormDto);
    return await this.formsRepository.save(form);
  }

  async findAll(appId?: string): Promise<Form[]> {
    const where = appId ? { app_id: appId } : {};
    
    return await this.formsRepository.find({
      where,
      relations: ['application', 'fields', 'subforms', 'parentForm'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Form> {
    const form = await this.formsRepository.findOne({
      where: { id },
      relations: ['application', 'fields', 'subforms', 'parentForm', 'customCode', 'permissions'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto): Promise<Form> {
    const form = await this.findOne(id);
    
    Object.assign(form, updateFormDto);
    return await this.formsRepository.save(form);
  }

  async remove(id: string): Promise<void> {
    const form = await this.findOne(id);
    await this.formsRepository.softRemove(form);
  }

  async findByApplication(appId: string): Promise<Form[]> {
    return this.findAll(appId);
  }

  async createField(formId: string, createFormFieldDto: CreateFormFieldDto): Promise<FormField> {
    const form = await this.findOne(formId);
    
    const field = this.formFieldsRepository.create({
      ...createFormFieldDto,
      form_id: formId,
    });

    return await this.formFieldsRepository.save(field);
  }

  async updateField(fieldId: string, updateFormFieldDto: UpdateFormFieldDto): Promise<FormField> {
    const field = await this.formFieldsRepository.findOne({
      where: { id: fieldId },
      relations: ['form'],
    });

    if (!field) {
      throw new NotFoundException('Form field not found');
    }

    Object.assign(field, updateFormFieldDto);
    return await this.formFieldsRepository.save(field);
  }

  async removeField(fieldId: string): Promise<void> {
    const field = await this.formFieldsRepository.findOne({
      where: { id: fieldId },
    });

    if (!field) {
      throw new NotFoundException('Form field not found');
    }

    await this.formFieldsRepository.remove(field);
  }

  async getFormFields(formId: string): Promise<FormField[]> {
    return await this.formFieldsRepository.find({
      where: { form_id: formId },
      order: { order_index: 'ASC' },
    });
  }

  async updateCustomCode(formId: string, frontendCode?: string, backendCode?: string, cssCode?: string): Promise<CustomFormCode> {
    let customCode = await this.customFormCodeRepository.findOne({
      where: { form_id: formId },
    });

    if (!customCode) {
      customCode = this.customFormCodeRepository.create({
        form_id: formId,
        frontend_code: frontendCode,
        backend_code: backendCode,
        css_code: cssCode,
      });
    } else {
      if (frontendCode !== undefined) customCode.frontend_code = frontendCode;
      if (backendCode !== undefined) customCode.backend_code = backendCode;
      if (cssCode !== undefined) customCode.css_code = cssCode;
    }

    return await this.customFormCodeRepository.save(customCode);
  }
}