import { IsEnum } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class UpdateFriendRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}