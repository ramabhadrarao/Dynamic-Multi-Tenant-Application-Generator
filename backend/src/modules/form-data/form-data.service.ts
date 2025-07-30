import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Form } from '../../entities/form.entity';
import { FormField, FieldType } from '../../entities/form-field.entity';
import { DynamicTablesService } from '../dynamic-tables/dynamic-tables.service';

@Injectable()
export class FormDataService {
  constructor(
    @InjectRepository(Form)
    private formsRepository: Repository<Form>,
    
    @InjectRepository(FormField)
    private formFieldsRepository: Repository<FormField>,
    
    private dynamicTablesService: DynamicTablesService,
    private dataSource: DataSource,
  ) {}

  async createFormData(formId: string, data: any, userId: string): Promise<any> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    // Validate and transform data based on field types
    const validatedData = await this.validateAndTransformData(form.fields, data);
    
    // Add metadata
    validatedData.created_by = userId;
    validatedData.created_at = new Date();
    validatedData.updated_at = new Date();

    // Insert data into dynamic table
    const result = await this.dataSource.query(
      `INSERT INTO ${form.table_name} SET ?`,
      [validatedData]
    );

    return {
      id: result.insertId,
      ...validatedData,
    };
  }

  async getFormData(formId: string, page: number = 1, limit: number = 10, filters?: any): Promise<any> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const queryParams: any[] = [];

    // Apply filters
    if (filters) {
      const filterConditions: string[] = [];
      
      Object.keys(filters).forEach((key) => {
        const field = form.fields.find(f => f.field_name === key);
        if (field && filters[key] !== undefined && filters[key] !== '') {
          switch (field.field_type) {
            case FieldType.TEXTBOX:
            case FieldType.TEXTAREA:
              filterConditions.push(`${key} LIKE ?`);
              queryParams.push(`%${filters[key]}%`);
              break;
            case FieldType.NUMBER:
              filterConditions.push(`${key} = ?`);
              queryParams.push(Number(filters[key]));
              break;
            case FieldType.DATE:
              filterConditions.push(`DATE(${key}) = ?`);
              queryParams.push(filters[key]);
              break;
            default:
              filterConditions.push(`${key} = ?`);
              queryParams.push(filters[key]);
          }
        }
      });

      if (filterConditions.length > 0) {
        whereClause = filterConditions.join(' AND ');
      }
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM ${form.table_name} WHERE ${whereClause}`;
    const countResult = await this.dataSource.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Get data
    const dataQuery = `
      SELECT * FROM ${form.table_name} 
      WHERE ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const data = await this.dataSource.query(dataQuery, [...queryParams, limit, offset]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFormDataById(formId: string, recordId: string): Promise<any> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    const data = await this.dataSource.query(
      `SELECT * FROM ${form.table_name} WHERE id = ?`,
      [recordId]
    );

    if (!data || data.length === 0) {
      throw new NotFoundException('Record not found');
    }

    return data[0];
  }

  async updateFormData(formId: string, recordId: string, data: any, userId: string): Promise<any> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    // Check if record exists
    const existingRecord = await this.getFormDataById(formId, recordId);
    if (!existingRecord) {
      throw new NotFoundException('Record not found');
    }

    // Validate and transform data
    const validatedData = await this.validateAndTransformData(form.fields, data);
    
    // Add metadata
    validatedData.updated_by = userId;
    validatedData.updated_at = new Date();

    // Update data
    await this.dataSource.query(
      `UPDATE ${form.table_name} SET ? WHERE id = ?`,
      [validatedData, recordId]
    );

    return {
      id: recordId,
      ...validatedData,
    };
  }

  async deleteFormData(formId: string, recordId: string): Promise<void> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    // Check if record exists
    const existingRecord = await this.getFormDataById(formId, recordId);
    if (!existingRecord) {
      throw new NotFoundException('Record not found');
    }

    // Delete record
    await this.dataSource.query(
      `DELETE FROM ${form.table_name} WHERE id = ?`,
      [recordId]
    );
  }

  private async validateAndTransformData(fields: FormField[], data: any): Promise<any> {
    const validatedData: any = {};

    for (const field of fields) {
      const value = data[field.field_name];

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`Field '${field.label}' is required`);
      }

      // Skip if value is undefined or null and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Transform based on field type
      switch (field.field_type) {
        case FieldType.NUMBER:
          if (value !== '') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              throw new BadRequestException(`Field '${field.label}' must be a valid number`);
            }
            validatedData[field.field_name] = numValue;
          }
          break;

        case FieldType.DATE:
          if (value !== '') {
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
              throw new BadRequestException(`Field '${field.label}' must be a valid date`);
            }
            validatedData[field.field_name] = dateValue;
          }
          break;

        case FieldType.CHECKBOX:
          validatedData[field.field_name] = Boolean(value);
          break;

        case FieldType.DROPDOWN_STATIC:
        case FieldType.RADIO:
          // Validate against options if provided
          if (field.options && value !== '') {
            try {
              const options = JSON.parse(field.options);
              const validValues = options.map((opt: any) => opt.value);
              if (!validValues.includes(value)) {
                throw new BadRequestException(`Invalid value for field '${field.label}'`);
              }
            } catch (e) {
              // If options parsing fails, accept any value
            }
          }
          validatedData[field.field_name] = value;
          break;

        default:
          validatedData[field.field_name] = value;
      }
    }

    return validatedData;
  }

  async exportFormData(formId: string, format: 'csv' | 'json' = 'csv'): Promise<any> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table configured');
    }

    const data = await this.dataSource.query(`SELECT * FROM ${form.table_name}`);

    if (format === 'json') {
      return data;
    }

    // Convert to CSV
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}