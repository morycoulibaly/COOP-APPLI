import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  telephone!: string;

  @IsString()
  @Length(6, 6, { message: 'Le code doit contenir 6 chiffres' })
  code!: string;
}
