import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, StatutCotisation } from '@prisma/client';
import { CotisationService } from './cotisation.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/roles.decorators';
import { CurrentUser } from '../auth/current-user.decorators';
import { JournalService } from '../journal/journal.service';

@Controller('cotisations')
@UseGuards(JwtAuthGuard)
export class CotisationController {
  constructor(
    private cotisationService: CotisationService,
    private journalService: JournalService,
  ) {}

  // ─── Adhérent : ses propres cotisations (tableau de bord) ───

  @Get('mine')
  findMine(@CurrentUser() currentUser: { userId: string }) {
    return this.cotisationService.findMine(currentUser.userId);
  }

  // ─── Consultation : ouvert à tous les utilisateurs connectés ─
  // (demande explicite du bureau de l'amicale — transparence sur les
  // cotisations, comme pour l'annuaire des membres)

  @Get()
  findAll(
    @Query('evenementId') evenementId?: string,
    @Query('statut') statut?: StatutCotisation,
    @Query('userId') userId?: string,
  ) {
    return this.cotisationService.findAll({ evenementId, statut, userId });
  }

  // ─── Admin : enregistrement d'un paiement ────────────────────

  @Post(':id/paiements')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async registerPaiement(
    @Param('id') id: string,
    @Body() dto: CreatePaiementDto,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const paiement = await this.cotisationService.registerPaiement(
      id,
      dto,
      currentUser.userId,
    );
    await this.journalService.log(
      currentUser.userId,
      'enregistrement_paiement',
      'cotisation',
      id,
    );
    return paiement;
  }
}
