import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class CreateEvenementDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  montantCotisation!: number;

  @IsDateString()
  dateEvenement!: string;

  @IsDateString()
  dateLimitePaiement!: string;
}
