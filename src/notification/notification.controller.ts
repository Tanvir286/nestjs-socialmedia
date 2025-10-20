// src/notification/notification.controller.ts
import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'; // আপনার Auth Guard এর সঠিক path দিন

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) {}

  // ব্যবহারকারীর সব নোটিফিকেশন আনুন
  @Get()
  getNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getNotifications(userId);
  }
  
  // ব্যবহারকারীর অপ্রাপ্ত নোটিফিকেশনের সংখ্যা আনুন
  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getUnreadCount(userId);
  }

  // একটি নোটিফিকেশনকে 'পড়া' হিসেবে মার্ক করুন
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    // URL থেকে id স্ট্রিং হিসেবে আসে, তাই এটিকে নম্বরে রূপান্তর করা হয়েছে (+) দিয়ে
    return this.notificationService.markAsRead(+id, userId);
  }
}