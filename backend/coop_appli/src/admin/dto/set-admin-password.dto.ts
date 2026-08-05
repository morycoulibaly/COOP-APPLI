import { IsString, IsNotEmpty, Length, MinLength } from 'class-validator';

export class SetAdminPasswordDto {
  @IsString()
  @IsNotEmpty()
  telephone!: string;

  @IsString()
  @Length(6, 6, { message: 'Le code doit contenir 6 chiffres' })
  code!: string;

  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  newPassword!: string;
}
