import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from '../../../../integrations/schedule/schedule.controller';
import { ScheduleService } from '../../../../integrations/schedule/schedule.service';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let scheduleService: jest.Mocked<ScheduleService>;

  beforeEach(async () => {
    const mockScheduleService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    scheduleService = module.get(ScheduleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have scheduleService injected', () => {
    expect(scheduleService).toBeDefined();
  });
});
