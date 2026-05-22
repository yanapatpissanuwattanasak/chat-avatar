import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorldModule } from './world/world.module';

@Module({
  imports: [WorldModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
