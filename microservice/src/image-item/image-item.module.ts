import { Module } from '@nestjs/common';
import { ImageItemController } from './image-item.controller';
import { ImageItemService } from './image-item.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'), // dist/../.. => uploads
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '');
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  ],
  controllers: [ImageItemController],
  providers: [ImageItemService],
})
export class ImageItemModule {}
