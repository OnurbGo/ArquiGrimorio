import { Module } from '@nestjs/common';
import { ImageItemController } from './image-item.controller';
import { ImageItemService } from './image-item.service';

@Module({
  controllers: [ImageItemController],
  providers: [ImageItemService],
})
export class ImageItemModule {}
