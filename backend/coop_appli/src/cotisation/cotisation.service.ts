import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StatutCotisation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';

@Injectable()
export class CotisationService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin : vue filtrable de toutes les cotisations ────────

  findAll(filters: {
    evenementId?: string;
    statut?: StatutCotisation;
    userId?: string;
  }) {
    return this.prisma.cotisation.findMany({
      where: {
        evenementId: filters.evenementId,
        statut: filters.statut,
        userId: filters.userId,
      },
      include: {
        evenement: { select: { id: true, nom: true, dateEvenement: true } },
        user: {
          select: { id: true, nom: true, prenom: true, telephone: true },
        },
        paiements: true,
      },
      orderBy: { dateEcheance: 'asc' },
    });
  }

  // ─── Adhérent : ses propres cotisations ──────────────────────

  findMine(userId: string) {
    return this.prisma.cotisation.findMany({
      where: { userId },
      include: {
        evenement: { select: { id: true, nom: true, dateEvenement: true } },
      },
      orderBy: { dateEcheance: 'asc' },
    });
  }

  // ─── Admin : enregistrement d'un paiement ────────────────────

  async registerPaiement(
    cotisationId: string,
    dto: CreatePaiementDto,
    adminId: string,
  ) {
    const cotisation = await this.prisma.cotisation.findUnique({
      where: { id: cotisationId },
    });
    if (!cotisation) {
      throw new NotFoundException('Cotisation introuvable');
    }
    if (cotisation.statut === StatutCotisation.PAYEE) {
      throw new BadRequestException(
        'Cette cotisation est déjà entièrement payée',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const paiement = await tx.paiement.create({
        data: {
          cotisationId,
          enregistrePar: adminId,
          montant: dto.montant,
          moyenPaiement: dto.moyenPaiement,
          note: dto.note,
        },
      });

      // Le montant restant à régler diminue à chaque paiement enregistré :
      // permet de gérer un paiement en plusieurs fois sans complexité ajoutée.
      const nouveauMontantDu = Math.max(
        Number(cotisation.montantDu) - dto.montant,
        0,
      );
      const nouveauStatut =
        nouveauMontantDu === 0
          ? StatutCotisation.PAYEE
          : StatutCotisation.EN_ATTENTE;

      await tx.cotisation.update({
        where: { id: cotisationId },
        data: { montantDu: nouveauMontantDu, statut: nouveauStatut },
      });

      return paiement;
    });
  }
}
