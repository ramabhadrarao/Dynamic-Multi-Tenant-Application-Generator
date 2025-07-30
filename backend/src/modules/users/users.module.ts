import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Application } from '../../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Application])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}