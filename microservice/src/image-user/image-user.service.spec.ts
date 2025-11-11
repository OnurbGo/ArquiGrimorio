import { Test, TestingModule } from '@nestjs/testing';
import { ImageUserService } from './image-user.service';

describe('ImageUserService', () => {
  let service: ImageUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageUserService],
    }).compile();

    service = module.get<ImageUserService>(ImageUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
