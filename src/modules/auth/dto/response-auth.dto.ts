import { Expose } from "class-transformer";

export class ResponseAuthDto {
  
  @Expose()
  name: string;

  @Expose()
  email: string;

}