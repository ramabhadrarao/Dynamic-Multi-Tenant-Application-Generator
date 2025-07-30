import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Form } from './form.entity';

@Entity('custom_form_code')
export class CustomFormCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  form_id: string;

  @Column({ type: 'longtext', nullable: true })
  frontend_code: string;

  @Column({ type: 'longtext', nullable: true })
  backend_code: string;

  @Column({ type: 'longtext', nullable: true })
  css_code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Form, form => form.customCode)
  @JoinColumn({ name: 'form_id' })
  form: Form;
}