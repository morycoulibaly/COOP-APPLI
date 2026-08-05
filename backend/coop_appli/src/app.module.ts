import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EvenementModule } from './evenement/evenement.module';
import { CotisationModule } from './cotisation/cotisation.module';
import { JournalModule } from './journal/journal.module';

@Module({
  imports: [
    PrismaModule,
    JournalModule,
    UsersModule,
    AuthModule,
    AdminModule,
    EvenementModule,
    CotisationModule,
  ],
})
export class AppModule {}
