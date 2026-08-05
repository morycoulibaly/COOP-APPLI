import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async generateAndSend(telephone: string): Promise<void> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Invalide les anciens codes non utilisés pour ce numéro
    await this.prisma.otpCode.updateMany({
      where: { telephone, consumed: false },
      data: { consumed: true },
    });

    await this.prisma.otpCode.create({
      data: { telephone, codeHash, expiresAt },
    });

    await this.smsService.sendOtp(telephone, code);
  }

  async verify(telephone: string, code: string): Promise<void> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { telephone, consumed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException(
        "Aucun code n'a été demandé pour ce numéro",
      );
    }
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException(
        "Le code a expiré, merci d'en demander un nouveau",
      );
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Trop de tentatives, merci de demander un nouveau code',
      );
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Code incorrect');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumed: true },
    });
  }

  private generateCode(): string {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    return String(Math.floor(min + Math.random() * (max - min))).padStart(
      OTP_LENGTH,
      '0',
    );
  }
}
