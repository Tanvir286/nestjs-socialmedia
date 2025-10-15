import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './modules/post/post.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaginationModule } from './common/pagination';
import { FriendModule } from './modules/friend/friend.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PaginationModule,
    PrismaModule,
    AuthModule,
    PostModule,
    CloudinaryModule,
    FriendModule,
    ConversationModule,
    MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
