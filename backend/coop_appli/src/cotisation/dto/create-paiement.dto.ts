import {
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { MoyenPaiement } from '@prisma/client';

export class CreatePaiementDto {
  @IsNumber()
  @IsPositive()
  montant!: number;

  @IsEnum(MoyenPaiement)
  moyenPaiement!: MoyenPaiement;

  @IsOptional()
  @IsString()
  note?: string;
}
