import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_filters')
export class ReportFilter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @Column({ type: 'varchar', length: 255 })
  field_name: string;

  @Column({ type: 'varchar', length: 255 })
  filter_type: string; // equals, contains, starts_with, ends_with, greater_than, less_than, between, in, not_in

  @Column({ type: 'text', nullable: true })
  options: string; // JSON string for filter options

  @Column({ type: 'text', nullable: true })
  default_value: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Report, report => report.filters)
  @JoinColumn({ name: 'report_id' })
  report: Report;
}