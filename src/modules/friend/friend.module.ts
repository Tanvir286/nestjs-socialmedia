import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageModule } from 'src/message/message.module';


@Module({
  imports: [
    PrismaModule,
    MessageModule
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
