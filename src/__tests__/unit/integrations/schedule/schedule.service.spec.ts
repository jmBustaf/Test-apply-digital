import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScheduleService } from '../../../../integrations/schedule/schedule.service';
import { ContentfulService } from '../../../../integrations/contentful/contentful.service';
import { MockServiceFactory } from '../../../../test-utils/helpers';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;
  let contentfulService: jest.Mocked<ContentfulService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockSchedulerRegistry = {
      addInterval: jest.fn(),
      deleteInterval: jest.fn(),
      doesExist: jest.fn(),
    };

    const mockContentfulService = {
      syncAll: jest.fn(),
    };

    const mockConfigService = MockServiceFactory.createConfigService({
      SYNC_JOB_NAME: 'test-sync-job',
      SYNC_INTERVAL_MS: 30000, // 30 seconds for testing
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    schedulerRegistry = module.get(SchedulerRegistry);
    contentfulService = module.get(ContentfulService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should run sync once and schedule interval', async () => {
      // Arrange
      const mockSyncResult = {
        total: 10,
        upserts: 8,
        softDeleted: 2,
      };
      contentfulService.syncAll.mockResolvedValue(mockSyncResult);

      // Act
      await service.onModuleInit();

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(1);
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'test-sync-job',
        expect.any(Object),
      );
    });

    it('should handle sync errors during initialization', async () => {
      // Arrange
      const error = new Error('Sync failed');
      contentfulService.syncAll.mockRejectedValue(error);

      // Act
      await service.onModuleInit();

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(1);
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'test-sync-job',
        expect.any(Object),
      );
    });

    it('should use default config values when not provided', async () => {
      // Arrange
      const mockConfigService = MockServiceFactory.createConfigService({});
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ScheduleService,
          {
            provide: SchedulerRegistry,
            useValue: schedulerRegistry,
          },
          {
            provide: ContentfulService,
            useValue: contentfulService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithDefaults = module.get<ScheduleService>(ScheduleService);
      contentfulService.syncAll.mockResolvedValue({ total: 0, upserts: 0, softDeleted: 0 });

      // Act
      await serviceWithDefaults.onModuleInit();

      // Assert
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'contentful-hourly-sync',
        expect.any(Object),
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should delete interval if it exists', () => {
      // Arrange
      schedulerRegistry.doesExist.mockReturnValue(true);

      // Act
      service.onModuleDestroy();

      // Assert
      expect(schedulerRegistry.doesExist).toHaveBeenCalledWith('interval', 'test-sync-job');
      expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith('test-sync-job');
    });

    it('should not delete interval if it does not exist', () => {
      // Arrange
      schedulerRegistry.doesExist.mockReturnValue(false);

      // Act
      service.onModuleDestroy();

      // Assert
      expect(schedulerRegistry.doesExist).toHaveBeenCalledWith('interval', 'test-sync-job');
      expect(schedulerRegistry.deleteInterval).not.toHaveBeenCalled();
    });
  });

  describe('runOnceSafely (private method)', () => {
    it('should skip execution if already running', async () => {
      // Arrange
      const mockSyncResult = { total: 5, upserts: 3, softDeleted: 2 };
      contentfulService.syncAll.mockResolvedValue(mockSyncResult);

      // Act - Call twice simultaneously to test running flag
      const promise1 = (service as any).runOnceSafely();
      const promise2 = (service as any).runOnceSafely();
      await Promise.all([promise1, promise2]);

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(1);
    });

    it('should execute sync and log success', async () => {
      // Arrange
      const mockSyncResult = {
        total: 15,
        upserts: 12,
        softDeleted: 3,
      };
      contentfulService.syncAll.mockResolvedValue(mockSyncResult);

      // Act
      await (service as any).runOnceSafely();

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(1);
    });

    it('should handle sync errors and log them', async () => {
      // Arrange
      const error = new Error('Contentful API error');
      contentfulService.syncAll.mockRejectedValue(error);

      // Act
      await (service as any).runOnceSafely();

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(1);
    });

    it('should reset running flag after completion', async () => {
      // Arrange
      const mockSyncResult = { total: 0, upserts: 0, softDeleted: 0 };
      contentfulService.syncAll.mockResolvedValue(mockSyncResult);

      // Act
      await (service as any).runOnceSafely();
      await (service as any).runOnceSafely(); // Should be able to run again

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(2);
    });

    it('should reset running flag after error', async () => {
      // Arrange
      const error = new Error('Database error');
      contentfulService.syncAll.mockRejectedValue(error);

      // Act
      await (service as any).runOnceSafely();
      await (service as any).runOnceSafely(); // Should be able to run again

      // Assert
      expect(contentfulService.syncAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuration', () => {
    it('should use custom job name from config', () => {
      // Arrange
      const customJobName = 'custom-sync-job';
      const mockConfigService = MockServiceFactory.createConfigService({
        SYNC_JOB_NAME: customJobName,
        SYNC_INTERVAL_MS: 60000,
      });

      // Act
      const service = new ScheduleService(schedulerRegistry, contentfulService, mockConfigService);

      // Assert
      expect((service as any).jobName).toBe(customJobName);
    });

    it('should use custom interval from config', () => {
      // Arrange
      const customInterval = 120000; // 2 minutes
      const mockConfigService = MockServiceFactory.createConfigService({
        SYNC_JOB_NAME: 'test-job',
        SYNC_INTERVAL_MS: customInterval,
      });

      // Act
      const service = new ScheduleService(schedulerRegistry, contentfulService, mockConfigService);

      // Assert
      expect((service as any).intervalMs).toBe(customInterval);
    });
  });
});
