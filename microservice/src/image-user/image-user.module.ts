import { Module } from '@nestjs/common';
import { ImageUserController } from './image-user.controller';
import { ImageUserService } from './image-user.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '');
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  ],
  controllers: [ImageUserController],
  providers: [ImageUserService],
})
export class ImageUserModule {}
