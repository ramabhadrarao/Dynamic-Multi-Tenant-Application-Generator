import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_columns')
export class ReportColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @Column({ type: 'varchar', length: 255 })
  column_name: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'boolean', default: false })
  is_calculated: boolean;

  @Column({ type: 'text', nullable: true })
  formula: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sort_direction: string; // ASC, DESC

  @Column({ type: 'boolean', default: true })
  visible: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Report, report => report.columns)
  @JoinColumn({ name: 'report_id' })
  report: Report;
}