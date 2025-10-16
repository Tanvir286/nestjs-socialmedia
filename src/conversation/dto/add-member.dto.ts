
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty({ message: 'Member ID cannot be empty.' })
  @IsNumber({}, { message: 'Member ID must be a number.' })
  memberId: number;
}