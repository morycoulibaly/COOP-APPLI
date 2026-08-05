import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { RequestRegisterOtpDto } from './dto/request-register-otp.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { SetAdminPasswordDto } from '../admin/dto/set-admin-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  // ─── Inscription adhérent (OTP) ─────────────────────────────

  async requestRegisterOtp(dto: RequestRegisterOtpDto): Promise<void> {
    const existing = await this.usersService.findByTelephone(dto.telephone);
    if (existing?.actif) {
      throw new ConflictException(
        'Un compte existe déjà avec ce numéro de téléphone',
      );
    }
    if (!existing) {
      await this.usersService.createPendingAdherent(dto);
    }
    await this.otpService.generateAndSend(dto.telephone);
  }

  async verifyRegisterOtp(dto: VerifyOtpDto) {
    await this.otpService.verify(dto.telephone, dto.code);

    const user = await this.usersService.findByTelephone(dto.telephone);
    if (!user) {
      throw new BadRequestException(
        'Aucune inscription en attente pour ce numéro',
      );
    }

    const activated = await this.usersService.activate(user.id);
    return this.buildAuthResponse(activated);
  }

  // ─── Connexion adhérent (OTP) ───────────────────────────────

  async requestLoginOtp(dto: RequestLoginOtpDto): Promise<void> {
    const user = await this.usersService.findByTelephone(dto.telephone);
    // Réponse volontairement neutre dans tous les cas (numéro inconnu, compte
    // inactif, ou admin qui doit utiliser le mot de passe).
    if (!user || !user.actif || user.role !== Role.ADHERENT) {
      return;
    }
    await this.otpService.generateAndSend(dto.telephone);
  }

  async verifyLoginOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByTelephone(dto.telephone);
    if (!user || !user.actif || user.role !== Role.ADHERENT) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    await this.otpService.verify(dto.telephone, dto.code);
    return this.buildAuthResponse(user);
  }

  // ─── Admin : connexion par mot de passe ─────────────────────

  async loginAdmin(dto: LoginDto) {
    const user = await this.usersService.findByTelephone(dto.telephone);
    if (
      !user ||
      !user.actif ||
      user.role !== Role.ADMIN ||
      !user.passwordHash
    ) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    return this.buildAuthResponse(user);
  }

  // ─── Admin : définir/réinitialiser le mot de passe via OTP ──

  async requestAdminPasswordOtp(dto: RequestLoginOtpDto): Promise<void> {
    const user = await this.usersService.findByTelephone(dto.telephone);
    if (!user || !user.actif || user.role !== Role.ADMIN) {
      return;
    }
    await this.otpService.generateAndSend(dto.telephone);
  }

  async setAdminPassword(dto: SetAdminPasswordDto) {
    const user = await this.usersService.findByTelephone(dto.telephone);
    if (!user || !user.actif || user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    await this.otpService.verify(dto.telephone, dto.code);

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    const updated = await this.usersService.setPassword(user.id, passwordHash);
    return this.buildAuthResponse(updated);
  }

  private buildAuthResponse(user: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    role: string;
  }) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        role: user.role,
      },
    };
  }
}
