import { Module } from '@nestjs/common';
import { CotisationController } from './cotisation.controller';
import { CotisationService } from './cotisation.service';
import { JournalModule } from '../journal/journal.module';

@Module({
  imports: [JournalModule],
  controllers: [CotisationController],
  providers: [CotisationService],
})
export class CotisationModule {}
