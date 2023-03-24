import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatModule } from './resource/cat/cat.module';

import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), CatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
