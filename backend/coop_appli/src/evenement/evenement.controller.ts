import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { EvenementService } from './evenement.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { UpdateEvenementDto } from './dto/update-evenement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/roles.decorators';
import { CurrentUser } from '../auth/current-user.decorators';
import { JournalService } from '../journal/journal.service';

@Controller('evenements')
@UseGuards(JwtAuthGuard) // Authentification requise pour tout, adhérent ou admin
export class EvenementController {
  constructor(
    private evenementService: EvenementService,
    private journalService: JournalService,
  ) {}

  // ─── Consultation : adhérents et admins ─────────────────────

  @Get()
  findAll() {
    return this.evenementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evenementService.findOne(id);
  }

  // ─── Gestion : admins uniquement ─────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreateEvenementDto,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const evenement = await this.evenementService.create(
      dto,
      currentUser.userId,
    );
    await this.journalService.log(
      currentUser.userId,
      'creation_evenement',
      'evenement',
      evenement.id,
    );
    return evenement;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEvenementDto,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const evenement = await this.evenementService.update(id, dto);
    await this.journalService.log(
      currentUser.userId,
      'modification_evenement',
      'evenement',
      id,
    );
    return evenement;
  }

  @Patch(':id/close')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async close(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const evenement = await this.evenementService.close(id);
    await this.journalService.log(
      currentUser.userId,
      'cloture_evenement',
      'evenement',
      id,
    );
    return evenement;
  }
}
