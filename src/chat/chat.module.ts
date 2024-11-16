import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import {DatabaseService} from '../db/db.providers';
import { JwtService } from "@nestjs/jwt";
import {UserService} from '../user/user.service'
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports:[
    MulterModule.register({
      storage:diskStorage({
        destination:'public/messages',
        filename:(req,file,cb) =>{
          cb(null,`${Date.now()}-${file.originalname}`)
        }
      })
    })
  ],
  providers: [ChatService,DatabaseService,JwtService,UserService],
  controllers: [ChatController]
})
export class ChatModule {}
