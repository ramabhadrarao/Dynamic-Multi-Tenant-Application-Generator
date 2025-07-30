import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { Form } from '../../entities/form.entity';
import { FormField } from '../../entities/form-field.entity';
import { CustomFormCode } from '../../entities/custom-form-code.entity';
import { Application } from '../../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormField, CustomFormCode, Application])],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}