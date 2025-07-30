import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Application } from './application.entity';
import { Form } from './form.entity';
import { ReportColumn } from './report-column.entity';
import { ReportFilter } from './report-filter.entity';
import { CustomReportCode } from './custom-report-code.entity';
import { ReportPermission } from './report-permission.entity';

export enum ReportType {
  BUILDER = 'builder',
  CUSTOM = 'custom'
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  form_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportType, default: ReportType.BUILDER })
  type: ReportType;

  @Column({ type: 'uuid' })
  app_id: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Application, application => application.reports)
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @ManyToOne(() => Form, form => form.reports)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @OneToMany(() => ReportColumn, column => column.report)
  columns: ReportColumn[];

  @OneToMany(() => ReportFilter, filter => filter.report)
  filters: ReportFilter[];

  @OneToMany(() => CustomReportCode, code => code.report)
  customCode: CustomReportCode[];

  @OneToMany(() => ReportPermission, permission => permission.report)
  permissions: ReportPermission[];
}