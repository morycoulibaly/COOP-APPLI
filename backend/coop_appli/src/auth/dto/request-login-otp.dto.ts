import { IsString, IsNotEmpty } from 'class-validator';

export class RequestLoginOtpDto {
  @IsString()
  @IsNotEmpty()
  telephone!: string;
}
