import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Report } from './report.entity';

@Entity('report_permissions')
export class ReportPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @Column({ type: 'boolean', default: false })
  can_view: boolean;

  @Column({ type: 'boolean', default: false })
  can_filter: boolean;

  @Column({ type: 'boolean', default: false })
  can_export: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Role, role => role.reportPermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Report, report => report.permissions)
  @JoinColumn({ name: 'report_id' })
  report: Report;
}