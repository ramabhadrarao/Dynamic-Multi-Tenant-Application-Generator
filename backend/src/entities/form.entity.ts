import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Application } from './application.entity';
import { FormField } from './form-field.entity';
import { CustomFormCode } from './custom-form-code.entity';
import { UserRolePermission } from './user-role-permission.entity';
import { Report } from './report.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_custom: boolean;

  @Column({ type: 'uuid', nullable: true })
  parent_form_id: string;

  @Column({ type: 'uuid' })
  app_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  table_name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Application, application => application.forms)
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @ManyToOne(() => Form, form => form.subforms)
  @JoinColumn({ name: 'parent_form_id' })
  parentForm: Form;

  @OneToMany(() => Form, form => form.parentForm)
  subforms: Form[];

  @OneToMany(() => FormField, field => field.form)
  fields: FormField[];

  @OneToMany(() => CustomFormCode, code => code.form)
  customCode: CustomFormCode[];

  @OneToMany(() => UserRolePermission, permission => permission.form)
  permissions: UserRolePermission[];

  @OneToMany(() => Report, report => report.form)
  reports: Report[];
}