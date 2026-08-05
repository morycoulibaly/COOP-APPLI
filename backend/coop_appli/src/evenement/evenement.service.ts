import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, StatutEvenement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';

@Injectable()
export class EvenementService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEvenementDto, createdBy: string) {
    // Transaction : si la génération des cotisations échoue, l'événement
    // n'est pas créé non plus (pas d'événement "orphelin" sans cotisations).
    return this.prisma.$transaction(async (tx) => {
      const evenement = await tx.evenement.create({
        data: {
          nom: dto.nom,
          description: dto.description,
          montantCotisation: dto.montantCotisation,
          dateEvenement: new Date(dto.dateEvenement),
          dateLimitePaiement: new Date(dto.dateLimitePaiement),
          createdBy,
        },
      });

      const adherentsActifs = await tx.user.findMany({
        where: { role: Role.ADHERENT, actif: true },
        select: { id: true },
      });

      if (adherentsActifs.length > 0) {
        await tx.cotisation.createMany({
          data: adherentsActifs.map((adherent) => ({
            userId: adherent.id,
            evenementId: evenement.id,
            montantDu: dto.montantCotisation,
            dateEcheance: new Date(dto.dateLimitePaiement),
          })),
        });
      }

      return evenement;
    });
  }

  findAll() {
    return this.prisma.evenement.findMany({
      orderBy: { dateEvenement: 'desc' },
    });
  }

  async findOne(id: string) {
    const evenement = await this.prisma.evenement.findUnique({
      where: { id },
      include: {
        cotisations: {
          include: {
            user: {
              select: { id: true, nom: true, prenom: true, telephone: true },
            },
          },
        },
      },
    });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    return evenement;
  }

  async update(id: string, dto: UpdateEvenementDto) {
    await this.ensureExists(id);
    // Ne touche jamais montantCotisation ici : modifier le montant d'un
    // événement déjà créé ne doit pas changer rétroactivement ce que les
    // adhérents doivent déjà (cotisations déjà générées).
    const { montantCotisation, ...rest } = dto;
    return this.prisma.evenement.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.dateEvenement && {
          dateEvenement: new Date(dto.dateEvenement!),
        }),
        ...(rest.dateLimitePaiement && {
          dateLimitePaiement: new Date(dto.dateLimitePaiement!),
        }),
      },
    });
  }

  async close(id: string) {
    await this.ensureExists(id);
    return this.prisma.evenement.update({
      where: { id },
      data: { statut: StatutEvenement.CLOS },
    });
  }

  private async ensureExists(id: string) {
    const evenement = await this.prisma.evenement.findUnique({ where: { id } });
    if (!evenement) {
      throw new NotFoundException('Événement introuvable');
    }
    return evenement;
  }
}
