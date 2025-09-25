import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaginationModule } from 'src/common/pagination';

@Module({
  imports: [
    PaginationModule,
    PrismaModule,
    CloudinaryModule
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
