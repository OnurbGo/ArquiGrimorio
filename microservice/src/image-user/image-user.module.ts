import { Module } from '@nestjs/common';
import { ImageUserController } from './image-user.controller';
import { ImageUserService } from './image-user.service';

@Module({
  controllers: [ImageUserController],
  providers: [ImageUserService],
})
export class ImageUserModule {}
