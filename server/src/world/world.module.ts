import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation/moderation.module';
import { WorldGateway } from './world.gateway';
import { WorldService } from './world.service';

@Module({
  imports: [ModerationModule],
  providers: [WorldGateway, WorldService],
})
export class WorldModule {}
