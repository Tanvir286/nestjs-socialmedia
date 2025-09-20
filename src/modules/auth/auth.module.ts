import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: appConfig().jwt.secret,
        signOptions: { expiresIn: appConfig().jwt.expiry },
      }),
    }),
    PrismaModule
  ],
  controllers: [AuthController], 
  providers: [AuthService, JwtStrategy], 
})
export class AuthModule {}
