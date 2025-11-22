import { Module, BadRequestException } from '@nestjs/common';
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
          const ext = extname(file.originalname || '').toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/png', 'image/jpeg'];
        const allowedExts = ['.png', '.jpg', '.jpeg'];
        const ext = extname(file.originalname || '').toLowerCase();

        if (
          !allowedMimes.includes(file.mimetype) ||
          !allowedExts.includes(ext)
        ) {
          console.log(
            `[image-user] rejected file=${file.originalname} mime=${file.mimetype} ext=${ext}`,
          );
          return cb(
            new BadRequestException(
              'Invalid file type. Please upload only PNG or JPEG (.png, .jpg, .jpeg).',
            ),
            false,
          );
        }
        console.log(
          `[image-user] accepted file=${file.originalname} mime=${file.mimetype} ext=${ext}`,
        );
        cb(null, true);
      },
    }),
  ],
  controllers: [ImageUserController],
  providers: [ImageUserService],
})
export class ImageUserModule {}
