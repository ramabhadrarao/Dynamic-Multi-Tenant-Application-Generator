import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('custom_report_code')
export class CustomReportCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @Column({ type: 'longtext', nullable: true })
  sql_query: string;

  @Column({ type: 'longtext', nullable: true })
  backend_code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Report, report => report.customCode)
  @JoinColumn({ name: 'report_id' })
  report: Report;
}