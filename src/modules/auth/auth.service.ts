import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  /*==============(Register a new user)==============*/
  async create(createAuthDto: CreateAuthDto) {

    const { name, email, password } = createAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const payload = { 
      id: user.id,
      email: user.email 
    };

    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  /*==============(Login a user)==============*/
  async login(loginAuthDto: { email: string; password: string }) {

    const { email, password } = loginAuthDto; 

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ConflictException('Invalid credentials');
    }

    const payload = { 
      id: user.id,
      email: user.email
    };

    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  /*==============(Retrieve all users)==============*/
  async findAll() {
    return this.prisma.user.findMany();
  }

  
}
