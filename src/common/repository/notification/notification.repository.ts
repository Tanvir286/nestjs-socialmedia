import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type NotificationType = 'FRIEND_REQUEST' | 'NEW_MESSAGE';

export class NotificationRepository {
  
  static async createNotification(payload: {
    sender_id: number;
    receiver_id: number;
    text: string;
    type: NotificationType;
    entity_id: string;
  }) {

    const { sender_id, receiver_id, text, type, entity_id } = payload;

    let notificationEvent = await prisma.notificationEvent.findFirst({
      where: { type, text },
    });

    if (!notificationEvent) {
      notificationEvent = await prisma.notificationEvent.create({
        data: { type, text },
      });
    }

    const newNotification = await prisma.notification.create({
      data: {
        sender_id,
        receiver_id,
        entity_id,
        notification_event_id: notificationEvent.id,
      },
    });

    return newNotification;
  }
}