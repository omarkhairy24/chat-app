import { Module } from '@nestjs/common';
import { GatwayService } from './gatway.service';
import { ChatService } from 'src/chat/chat.service';
import { DatabaseService } from 'src/db/db.providers';

@Module({
  providers: [GatwayService,ChatService,DatabaseService]
})
export class GatwayModule {}
