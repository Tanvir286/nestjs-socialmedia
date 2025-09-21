import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Privacy } from '@prisma/client';
import { Type } from "class-transformer";

export class CreatePostDto {

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(Privacy)
  published?: Privacy;

  @IsInt()
  @Type(() => Number) // converts string "1" → number 1
  authorId: number;

}
