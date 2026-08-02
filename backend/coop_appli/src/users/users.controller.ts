import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('users')
@UseGuards(JwtAuthGuard) // Connecté suffit : pas de restriction de rôle ici
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Annuaire des membres de l'amicale (nom, prénom, téléphone)
  @Get('members')
  findAllMembers() {
    return this.usersService.findAllMembers();
  }
}
