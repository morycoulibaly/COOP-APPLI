import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  telephone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
