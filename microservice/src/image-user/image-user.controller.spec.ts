import { Test, TestingModule } from '@nestjs/testing';
import { ImageUserController } from './image-user.controller';

describe('ImageUserController', () => {
  let controller: ImageUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageUserController],
    }).compile();

    controller = module.get<ImageUserController>(ImageUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
