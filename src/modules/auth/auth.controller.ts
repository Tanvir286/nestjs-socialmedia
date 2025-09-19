import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TransformDTO } from 'src/common/interceptors/transform-dto.interceptor';
import { ResponseAuthDto } from './dto/response-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*==============(Register a new user)==============*/
  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto) {

    try {
      const result = await this.authService.create(createAuthDto);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong',
      };
    }

  }

  /*==============(Login a user)==============*/
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    try {
      const result = await this.authService.login(loginAuthDto);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  /*==============(Retrieve all users)==============*/
  @TransformDTO(ResponseAuthDto)
  @Get('allusers')
  async findAll() {
    try {
      const users = await this.authService.findAll();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }



}
