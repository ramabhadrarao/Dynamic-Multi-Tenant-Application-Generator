import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    const { password_hash, ...result } = savedUser;
    return result as User;
  }

  async findAll(appId?: string): Promise<User[]> {
    const where = appId ? { app_id: appId } : {};
    
    return await this.usersRepository.find({
      where,
      relations: ['role', 'application'],
      select: ['id', 'username', 'email', 'first_name', 'last_name', 'active', 'app_id', 'role_id', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'application', 'permissions'],
      select: ['id', 'username', 'email', 'first_name', 'last_name', 'active', 'app_id', 'role_id', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);
    
    const { password_hash, ...result } = savedUser;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async findByApplication(appId: string): Promise<User[]> {
    return this.findAll(appId);
  }
}