import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './modules/post/post.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    PrismaModule,
    AuthModule,
    PostModule,
    CloudinaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
