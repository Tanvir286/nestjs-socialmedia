import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateConversationDto {

    @IsInt()
    @IsNotEmpty()
    friendId: number;
}
