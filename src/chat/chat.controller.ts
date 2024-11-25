import { Controller,Get,Post,Body,UseGuards,Request,Param, UploadedFiles, UseInterceptors } from '@nestjs/common';
import {ChatService} from './chat.service';
import {AuthGuard} from '../user/guard/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService:ChatService,
  ){}

  @UseGuards(AuthGuard)
  @Post('/send_message')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 5 }
    ])
  )
  async sendMessage(
    @Body() body:{group_id:(number | null),reciever_id:string | null,content:string,image:string[]},
    @Request() req:any,
    @UploadedFiles() files:{ image?: Express.Multer.File[] }
  ){  
    if(files && files.image){
      const images = files.image.map(i=> i.filename);
      body.image = images
    }
    const message = await this.chatService.sendMessage(
      req.user.sub || req.cookies.auth_token ,body.group_id ,body.reciever_id,body.content,body.image
    );
    return message
  }

  @UseGuards(AuthGuard)
  @Get('/get-chat/:id')
  getChat(
    @Param('id') id:string,
    @Request() req:any
  ){
    return this.chatService.getChat(req.user.sub || req.cookies.auth_token, id);
  }

  @UseGuards(AuthGuard)
  @Get('/get-chats')
  getChats(
    @Request() req:any
  ){
    return this.chatService.getChats(req.user.sub || req.cookies.auth_token );
  }

  @UseGuards(AuthGuard)
  @Get('/get-contacts')
  getContacts(
    @Request() req:any
  ){
    return this.chatService.getContacts(req.user.sub || req.cookies.auth_token);
  }
}
