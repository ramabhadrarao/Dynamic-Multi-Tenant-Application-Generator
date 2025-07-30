import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Form } from '../../entities/form.entity';
import { FormField, FieldType } from '../../entities/form-field.entity';

@Injectable()
export class DynamicTablesService {
  private readonly logger = new Logger(DynamicTablesService.name);

  constructor(
    @InjectRepository(Form)
    private formsRepository: Repository<Form>,
    
    @InjectRepository(FormField)
    private formFieldsRepository: Repository<FormField>,
    
    private dataSource: DataSource,
  ) {}

  async createTableForForm(formId: string): Promise<void> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table name configured');
    }

    // Check if table already exists
    const tableExists = await this.checkTableExists(form.table_name);
    if (tableExists) {
      this.logger.warn(`Table ${form.table_name} already exists, skipping creation`);
      return;
    }

    // Generate CREATE TABLE SQL
    const createTableSQL = this.generateCreateTableSQL(form.table_name, form.fields);
    
    try {
      await this.dataSource.query(createTableSQL);
      this.logger.log(`Successfully created table: ${form.table_name}`);
    } catch (error) {
      this.logger.error(`Failed to create table ${form.table_name}:`, error);
      throw new BadRequestException(`Failed to create table: ${error.message}`);
    }
  }

  async updateTableForForm(formId: string): Promise<void> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
      relations: ['fields'],
    });

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    if (!form.table_name) {
      throw new BadRequestException('Form does not have a table name configured');
    }

    // Check if table exists
    const tableExists = await this.checkTableExists(form.table_name);
    if (!tableExists) {
      // Create table if it doesn't exist
      await this.createTableForForm(formId);
      return;
    }

    // Get current table structure
    const currentColumns = await this.getTableColumns(form.table_name);
    const currentColumnNames = currentColumns.map(col => col.Field);

    // Get required columns from form fields
    const requiredColumns = form.fields.map(field => field.field_name);
    
    // Add new columns
    for (const field of form.fields) {
      if (!currentColumnNames.includes(field.field_name)) {
        const columnSQL = this.generateColumnSQL(field);
        const alterSQL = `ALTER TABLE ${form.table_name} ADD COLUMN ${columnSQL}`;
        
        try {
          await this.dataSource.query(alterSQL);
          this.logger.log(`Added column ${field.field_name} to table ${form.table_name}`);
        } catch (error) {
          this.logger.error(`Failed to add column ${field.field_name}:`, error);
        }
      }
    }

    // Note: We don't remove columns that are no longer in the form
    // to prevent data loss. This is a design decision for safety.
  }

  async dropTableForForm(formId: string): Promise<void> {
    const form = await this.formsRepository.findOne({
      where: { id: formId },
    });

    if (!form || !form.table_name) {
      return;
    }

    const tableExists = await this.checkTableExists(form.table_name);
    if (!tableExists) {
      return;
    }

    try {
      await this.dataSource.query(`DROP TABLE ${form.table_name}`);
      this.logger.log(`Successfully dropped table: ${form.table_name}`);
    } catch (error) {
      this.logger.error(`Failed to drop table ${form.table_name}:`, error);
      throw new BadRequestException(`Failed to drop table: ${error.message}`);
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [tableName]
      );
      return result[0].count > 0;
    } catch (error) {
      this.logger.error(`Error checking if table exists: ${error.message}`);
      return false;
    }
  }

  private async getTableColumns(tableName: string): Promise<any[]> {
    try {
      return await this.dataSource.query(`DESCRIBE ${tableName}`);
    } catch (error) {
      this.logger.error(`Error getting table columns: ${error.message}`);
      return [];
    }
  }

  private generateCreateTableSQL(tableName: string, fields: FormField[]): string {
    const columns = [
      'id INT AUTO_INCREMENT PRIMARY KEY',
      ...fields.map(field => this.generateColumnSQL(field)),
      'created_by VARCHAR(36)',
      'updated_by VARCHAR(36)',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ];

    return `CREATE TABLE ${tableName} (${columns.join(', ')}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  }

  private generateColumnSQL(field: FormField): string {
    const columnName = field.field_name;
    let columnType = this.getColumnType(field.field_type);
    
    // Add constraints
    const constraints = [];
    
    if (field.required) {
      constraints.push('NOT NULL');
    } else {
      constraints.push('NULL');
    }

    if (field.default_value) {
      const defaultValue = this.formatDefaultValue(field.default_value, field.field_type);
      constraints.push(`DEFAULT ${defaultValue}`);
    }

    return `${columnName} ${columnType} ${constraints.join(' ')}`;
  }

  private getColumnType(fieldType: FieldType): string {
    switch (fieldType) {
      case FieldType.TEXTBOX:
        return 'VARCHAR(255)';
      case FieldType.TEXTAREA:
      case FieldType.RICH_TEXT:
        return 'TEXT';
      case FieldType.NUMBER:
        return 'DECIMAL(15,2)';
      case FieldType.DATE:
        return 'DATE';
      case FieldType.TIME:
        return 'TIME';
      case FieldType.DATETIME:
        return 'DATETIME';
      case FieldType.CHECKBOX:
      case FieldType.TOGGLE:
        return 'BOOLEAN';
      case FieldType.DROPDOWN_STATIC:
      case FieldType.DROPDOWN_LOOKUP:
      case FieldType.RADIO:
        return 'VARCHAR(100)';
      case FieldType.FILE_UPLOAD:
        return 'VARCHAR(500)';
      case FieldType.SIGNATURE:
        return 'LONGTEXT';
      case FieldType.HIDDEN:
        return 'VARCHAR(255)';
      case FieldType.CALCULATED:
        return 'VARCHAR(255)';
      default:
        return 'VARCHAR(255)';
    }
  }

  private formatDefaultValue(value: string, fieldType: FieldType): string {
    switch (fieldType) {
      case FieldType.NUMBER:
        return value;
      case FieldType.CHECKBOX:
      case FieldType.TOGGLE:
        return value.toLowerCase() === 'true' ? '1' : '0';
      case FieldType.DATE:
      case FieldType.TIME:
      case FieldType.DATETIME:
        if (value.toLowerCase() === 'now' || value.toLowerCase() === 'current_timestamp') {
          return 'CURRENT_TIMESTAMP';
        }
        return `'${value}'`;
      default:
        return `'${value.replace(/'/g, "''")}'`;
    }
  }

  async getTableStructure(tableName: string): Promise<any> {
    const tableExists = await this.checkTableExists(tableName);
    if (!tableExists) {
      throw new BadRequestException(`Table ${tableName} does not exist`);
    }

    const columns = await this.getTableColumns(tableName);
    const indexes = await this.dataSource.query(`SHOW INDEX FROM ${tableName}`);

    return {
      tableName,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
        extra: col.Extra,
      })),
      indexes: indexes.map(idx => ({
        name: idx.Key_name,
        column: idx.Column_name,
        unique: idx.Non_unique === 0,
      })),
    };
  }

  async listTables(): Promise<string[]> {
    try {
      const result = await this.dataSource.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`
      );
      return result.map((row: any) => row.table_name);
    } catch (error) {
      this.logger.error(`Error listing tables: ${error.message}`);
      return [];
    }
  }
}