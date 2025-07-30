import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Application } from './application.entity';
import { User } from './user.entity';
import { UserRolePermission } from './user-role-permission.entity';
import { FieldPermission } from './field-permission.entity';
import { ReportPermission } from './report-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  app_id: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Application, application => application.roles)
  @JoinColumn({ name: 'app_id' })
  application: Application;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => UserRolePermission, permission => permission.role)
  formPermissions: UserRolePermission[];

  @OneToMany(() => FieldPermission, permission => permission.role)
  fieldPermissions: FieldPermission[];

  @OneToMany(() => ReportPermission, permission => permission.role)
  reportPermissions: ReportPermission[];
}