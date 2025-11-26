import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image-user')
export class ImageUserController {
  @Get()
  hello(): string {
    return 'Image-user working';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      console.log('[image-user] no file received');
      throw new BadRequestException('File not provided.');
    }
    console.log(
      `[image-user] received file orig=${file.originalname} stored=${file.filename} mime=${file.mimetype} size=${file.size}`,
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
