import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicTablesController } from './dynamic-tables.controller';
import { DynamicTablesService } from './dynamic-tables.service';
import { Form } from '../../entities/form.entity';
import { FormField } from '../../entities/form-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormField])],
  controllers: [DynamicTablesController],
  providers: [DynamicTablesService],
  exports: [DynamicTablesService],
})
export class DynamicTablesModule {}