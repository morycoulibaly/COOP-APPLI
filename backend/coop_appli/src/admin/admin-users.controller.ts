import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JournalService } from '../journal/journal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/roles.decorators';
import { CurrentUser } from '../auth/current-user.decorators';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(
    private usersService: UsersService,
    private journalService: JournalService,
  ) {}

  // Liste tous les utilisateurs, avec filtre optionnel ?role=ADHERENT|ADMIN
  @Get()
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  // Création directe d'un nouveau compte admin (mot de passe défini ensuite
  // par le nouvel admin via /auth/admin/password/request-otp puis /set)
  @Post()
  async createAdmin(
    @Body() dto: CreateAdminDto,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const admin = await this.usersService.createAdmin(dto);
    await this.journalService.log(
      currentUser.userId,
      'creation_admin',
      'user',
      admin.id,
    );
    return admin;
  }

  // Promotion d'un adhérent existant au rôle admin
  @Patch(':id/promote')
  async promote(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const user = await this.usersService.promoteToAdmin(id);
    await this.journalService.log(
      currentUser.userId,
      'promotion_admin',
      'user',
      id,
    );
    return user;
  }

  // Désactivation d'un compte (adhérent ou admin)
  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const user = await this.usersService.deactivate(id);
    await this.journalService.log(
      currentUser.userId,
      'desactivation_compte',
      'user',
      id,
    );
    return user;
  }

  // Réactivation d'un compte précédemment désactivé
  @Patch(':id/reactivate')
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const user = await this.usersService.activate(id);
    await this.journalService.log(
      currentUser.userId,
      'reactivation_compte',
      'user',
      id,
    );
    return user;
  }
}
