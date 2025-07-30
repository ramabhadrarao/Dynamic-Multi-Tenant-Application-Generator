import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormDataController } from './form-data.controller';
import { FormDataService } from './form-data.service';
import { Form } from '../../entities/form.entity';
import { FormField } from '../../entities/form-field.entity';
import { DynamicTablesModule } from '../dynamic-tables/dynamic-tables.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, FormField]),
    DynamicTablesModule,
  ],
  controllers: [FormDataController],
  providers: [FormDataService],
  exports: [FormDataService],
})
export class FormDataModule {}