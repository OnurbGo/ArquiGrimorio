import { Test, TestingModule } from '@nestjs/testing';
import { ImageItemController } from './image-item.controller';

describe('ImageItemController', () => {
  let controller: ImageItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageItemController],
    }).compile();

    controller = module.get<ImageItemController>(ImageItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
