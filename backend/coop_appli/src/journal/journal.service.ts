import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  log(adminId: string, action: string, cibleType: string, cibleId: string) {
    return this.prisma.journalActivite.create({
      data: { adminId, action, cibleType, cibleId },
    });
  }
}
