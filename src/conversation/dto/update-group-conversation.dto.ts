import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateGroupConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Group name cannot be longer than 100 characters.' })
  groupName?: string;

}
