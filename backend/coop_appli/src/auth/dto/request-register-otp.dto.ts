import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class RequestRegisterOtpDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsString()
  @IsNotEmpty()
  telephone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
