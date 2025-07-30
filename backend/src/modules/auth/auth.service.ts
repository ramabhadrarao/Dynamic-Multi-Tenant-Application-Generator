import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Application } from '../../entities/application.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { username, active: true },
      relations: ['application', 'role'],
    });

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      app_id: user.app_id,
      role_id: user.role_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        app_id: user.app_id,
        role: user.role,
        application: user.application,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password_hash: hashedPassword,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      app_id: registerDto.app_id,
      role_id: registerDto.role_id,
    });

    await this.usersRepository.save(user);
    
    const { password_hash, ...result } = user;
    return result;
  }

  async validateUserById(userId: string) {
    return await this.usersRepository.findOne({
      where: { id: userId, active: true },
      relations: ['application', 'role'],
    });
  }
}