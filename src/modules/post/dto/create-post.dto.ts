import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Privacy } from '@prisma/client';

export class CreatePostDto {

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrls?: string;

  @IsOptional()
  @IsEnum(Privacy)
  published?: Privacy;

  @IsInt()
  authorId: number;

}
