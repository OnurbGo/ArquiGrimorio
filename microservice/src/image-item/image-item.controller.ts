import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';

@Controller('image-item')
export class ImageItemController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      console.log('[image-item] no file received');
      throw new BadRequestException('File not provided.');
    }
    console.log(
      `[image-item] received file orig=${file.originalname} stored=${file.filename} mime=${file.mimetype} size=${file.size}`,
    );
    return {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      urlNginx: `/image/uploads/${file.filename}`,
    };
  }
}
