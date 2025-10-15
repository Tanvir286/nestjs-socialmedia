import { IsInt, IsNotEmpty } from "class-validator";

export class CreateConversationDto {

    @IsInt()
    @IsNotEmpty()
    friendId: number;
}
