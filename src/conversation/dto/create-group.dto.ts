import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateGroupDto {   

    @IsString()
    @IsNotEmpty()
    groupName: string;

    @IsArray()
    @ArrayMinSize(1)
    participantIds: number[];


}