import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { UsersModule } from '../users/users.module';
import { JournalModule } from '../journal/journal.module';

@Module({
  imports: [UsersModule, JournalModule],
  controllers: [AdminUsersController],
})
export class AdminModule {}
