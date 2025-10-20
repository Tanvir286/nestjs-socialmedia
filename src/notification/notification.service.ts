
// src/notification/notification.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {

  constructor(private readonly prisma: PrismaService) {}

  // ব্যবহারকারীর সব নোটিফিকেশন আনুন
  async getNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { receiver_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true },
        },
        notification_event: { // ইভেন্টের তথ্যও আনা হলো
          select: { type: true, text: true },
        },
      },
    });

    return {
      success: true,
      count: notifications.length,
      data: notifications,
    };
  }


  // অপঠিত নোটিফিকেশনের সংখ্যা গণনা করুন
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        receiver_id: userId,
        read_at: null, // অপঠিত নোটিফিকেশন মানে read_at ফিল্ডটি null
      },
    });
    
    return {
      success: true,
      unreadCount: count,
    };
  }


  // একটি নোটিফিকেশনকে 'পড়া' হিসেবে মার্ক করুন
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (notification.receiver_id !== userId) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }
    
    // যদি ইতোমধ্যে পড়া হয়ে থাকে, তাহলে আর আপডেট করার দরকার নেই
    if (notification.read_at) {
        return { success: true, message: 'Notification was already read.', data: notification };
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() }, // 'read_at' ফিল্ডে বর্তমান সময় সেট করা হলো
    });

    return {
      success: true,
      message: 'Notification marked as read.',
      data: updatedNotification,
    };
  }
  
  
}