import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * TODO: brancher un vrai fournisseur SMS (Twilio, ou un agrégateur local
   * ivoirien) une fois le compte créé. En attendant, le code est simplement
   * loggé pour permettre de tester le flux OTP en développement.
   */
  async sendOtp(telephone: string, code: string): Promise<void> {
    this.logger.log(`[DEV] Code OTP pour ${telephone} : ${code}`);
    // Exemple d'implémentation réelle avec Twilio :
    // await twilioClient.messages.create({
    //   to: telephone,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: `Votre code COOP'APPLI : ${code}`,
    // });
  }
}
