import {
  Body,
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  ConflictException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CurrentUser } from '../auth/current-user.decorators';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('members')
  findAllMembers() {
    return this.usersService.findAllMembers();
  }

  @Get('members/:id')
  async findMemberDetail(
    @Param('id') id: string,
    @CurrentUser() currentUser: { role: string },
  ) {
    const membre = await this.usersService.findMemberById(id);
    if (!membre) {
      throw new NotFoundException('Membre introuvable');
    }
    if (currentUser.role !== Role.ADMIN) {
      const { role, ...visible } = membre;
      return visible;
    }
    return membre;
  }

  @Patch('me')
  async updateMyProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: { userId: string },
  ) {
    const existing = await this.usersService.findByTelephone(dto.telephone);
    if (existing && existing.id !== currentUser.userId) {
      throw new ConflictException(
        'Ce numéro est déjà utilisé par un autre compte',
      );
    }
    return this.usersService.updateTelephone(currentUser.userId, dto.telephone);
  }

  // Upload de la photo de profil. Stockage sur disque local pour l'instant :
  // fonctionne en développement, mais ATTENTION en production sur un hébergeur
  // au système de fichiers éphémère (Railway, Render...) — les fichiers seraient
  // perdus à chaque redéploiement. Il faudra migrer vers un stockage objet
  // (S3, Cloudinary...) avant la mise en production réelle.
  @Post('me/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${suffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Seules les images JPG, PNG ou WEBP sont acceptées',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: { userId: string },
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const photoUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updatePhoto(currentUser.userId, photoUrl);
  }
}
