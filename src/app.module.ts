import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule,ConfigService } from '@nestjs/config';
import {DatabaseService} from './db/db.providers';
import { ChatModule } from './chat/chat.module';
import { PendingModule } from './pending/pending.module';
import { GatwayModule } from './gatway/gatway.module';
import { ViewsModule } from './views/views.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:`.env.${process.env.NODE_ENV}`
    }),
    UserModule,
    ChatModule,
    PendingModule,
    GatwayModule,
    ViewsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService,DatabaseService],
  exports:[DatabaseService],
})
export class AppModule {}
