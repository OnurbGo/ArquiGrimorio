import { Controller, Get } from '@nestjs/common';

@Controller('image-user')
export class ImageUserController {
  @Get()
  hello(): string {
    return 'hello world';
  }
}
