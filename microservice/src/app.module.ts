import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageItemModule } from './image-item/image-item.module';
import { ImageUserModule } from './image-user/image-user.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.model.{ts,js}'],
        synchronize: true,
        autoLoadEntities: false,
      }),
    }),
    ImageItemModule,
    ImageUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
