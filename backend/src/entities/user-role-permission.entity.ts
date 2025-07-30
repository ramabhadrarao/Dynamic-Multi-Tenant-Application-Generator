import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Form } from './form.entity';

@Entity('user_role_permissions')
export class UserRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid' })
  form_id: string;

  @Column({ type: 'boolean', default: false })
  can_create: boolean;

  @Column({ type: 'boolean', default: false })
  can_read: boolean;

  @Column({ type: 'boolean', default: false })
  can_update: boolean;

  @Column({ type: 'boolean', default: false })
  can_delete: boolean;

  @Column({ type: 'boolean', default: false })
  can_filter: boolean;

  @Column({ type: 'uuid' })
  assigned_by: string;

  @CreateDateColumn()
  assigned_at: Date;

  @ManyToOne(() => Role, role => role.formPermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Form, form => form.permissions)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assignedBy: User;
}