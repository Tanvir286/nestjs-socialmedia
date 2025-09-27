import { IsInt } from "class-validator";

export class CreateFriendRequestDto {
  @IsInt()
  receiverId: number;
}
