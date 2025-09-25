import { IsOptional } from 'class-validator';

export class CursorPaginationDto {
  @IsOptional()
  cursor?: string; 

  @IsOptional()
  take?: number;
}
