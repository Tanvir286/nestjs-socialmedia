

import { IsNotEmpty, IsNumber } from 'class-validator';

export class RemoveMemberDto {
  @IsNotEmpty({ message: 'Member ID cannot be empty.' })
  @IsNumber({}, { message: 'Member ID must be a number.' })
  memberId: number;
}