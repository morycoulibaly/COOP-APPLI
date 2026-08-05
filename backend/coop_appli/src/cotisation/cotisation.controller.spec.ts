import { Test, TestingModule } from '@nestjs/testing';
import { CotisationController } from './cotisation.controller';
import { CotisationService } from './cotisation.service';

describe('CotisationController', () => {
  let controller: CotisationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotisationController],
      providers: [CotisationService],
    }).compile();

    controller = module.get<CotisationController>(CotisationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
