import { Module } from '@nestjs/common';
import { EvenementController } from './evenement.controller';
import { EvenementService } from './evenement.service';
import { JournalModule } from '../journal/journal.module';

@Module({
  imports: [JournalModule],
  controllers: [EvenementController],
  providers: [EvenementService],
  exports: [EvenementService],
})
export class EvenementModule {}
