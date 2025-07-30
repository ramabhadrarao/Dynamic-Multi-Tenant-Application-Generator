import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Form } from './form.entity';
import { FieldPermission } from './field-permission.entity';

export enum FieldType {
  TEXTBOX = 'textbox',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  CHECKBOX = 'checkbox',
  TOGGLE = 'toggle',
  DROPDOWN_STATIC = 'dropdown_static',
  DROPDOWN_LOOKUP = 'dropdown_lookup',
  RADIO = 'radio',
  FILE_UPLOAD = 'file_upload',
  RICH_TEXT = 'rich_text',
  SIGNATURE = 'signature',
  HIDDEN = 'hidden',
  SUBFORM = 'subform',
  CALCULATED = 'calculated'
}

@Entity('form_fields')
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  form_id: string;

  @Column({ type: 'varchar', length: 255 })
  field_name: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'enum', enum: FieldType })
  field_type: FieldType;

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ type: 'text', nullable: true })
  default_value: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Column({ type: 'boolean', default: false })
  readonly: boolean;

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column({ type: 'text', nullable: true })
  show_if: string;

  @Column({ type: 'text', nullable: true })
  hide_if: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filter_by_field: string;

  @Column({ type: 'boolean', default: false })
  is_lookup: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lookup_table: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lookup_key: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lookup_label: string;

  @Column({ type: 'text', nullable: true })
  validation_rules: string;

  @Column({ type: 'text', nullable: true })
  options: string; // JSON string for dropdown/radio options

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Form, form => form.fields)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @OneToMany(() => FieldPermission, permission => permission.field)
  permissions: FieldPermission[];
}