import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto, userId: string): Promise<Application> {
    const existingApp = await this.applicationsRepository.findOne({
      where: [
        { code: createApplicationDto.code },
        { db_name: createApplicationDto.db_name }
      ]
    });

    if (existingApp) {
      throw new ConflictException('Application code or database name already exists');
    }

    const application = this.applicationsRepository.create({
      ...createApplicationDto,
      created_by: userId,
    });

    return await this.applicationsRepository.save(application);
  }

  async findAll(): Promise<Application[]> {
    return await this.applicationsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['users', 'forms', 'reports', 'roles'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findOne(id);
    
    Object.assign(application, updateApplicationDto);
    return await this.applicationsRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationsRepository.softRemove(application);
  }

  async findByCode(code: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { code, active: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }
}