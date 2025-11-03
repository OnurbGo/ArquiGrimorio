import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
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
      return { error: 'no file received' };
    }
    return {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      // Acesso direto no serviço:
      url: `/uploads/${file.filename}`,
      // Acesso via Nginx:
      urlNginx: `/image/uploads/${file.filename}`,
    };
  }
}
