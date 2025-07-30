import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Form } from './form.entity';
import { FormField } from './form-field.entity';

@Entity('field_permissions')
export class FieldPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid' })
  form_id: string;

  @Column({ type: 'uuid' })
  field_id: string;

  @Column({ type: 'boolean', default: true })
  can_view: boolean;

  @Column({ type: 'boolean', default: true })
  can_edit: boolean;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Role, role => role.fieldPermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Form)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @ManyToOne(() => FormField, field => field.permissions)
  @JoinColumn({ name: 'field_id' })
  field: FormField;
}