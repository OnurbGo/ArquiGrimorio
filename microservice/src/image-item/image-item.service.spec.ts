import { Test, TestingModule } from '@nestjs/testing';
import { ImageItemService } from './image-item.service';

describe('ImageItemService', () => {
  let service: ImageItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageItemService],
    }).compile();

    service = module.get<ImageItemService>(ImageItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
