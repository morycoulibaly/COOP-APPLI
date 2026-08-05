import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { IsNotBeforeToday } from '../../common/validators/is-not-before-today.validator';

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
  @IsNotBeforeToday({
    message: "La date de l'événement ne peut pas être antérieure à aujourd'hui",
  })
  dateEvenement!: string;

  // Même garde-fou sur l'échéance de paiement : une date limite déjà passée
  // au moment de la création n'aurait aucun sens.
  @IsDateString()
  @IsNotBeforeToday({
    message:
      "La date limite de paiement ne peut pas être antérieure à aujourd'hui",
  })
  dateLimitePaiement!: string;
}
