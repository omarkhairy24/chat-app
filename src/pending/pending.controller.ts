import { Body, Controller, Delete, Get, Post, Request, UseGuards } from '@nestjs/common';
import { PendingService } from './pending.service';
import { AuthGuard } from 'src/user/guard/auth.guard';

@Controller('pending')
export class PendingController {

    constructor(private pendingService:PendingService){}


    @UseGuards(AuthGuard)
    @Get('/pendings')
    async getPendings(
        @Request() req:any
    ){
        return await this.pendingService.getPendigs(req.user.sub || req.cookies.auth_token);
    }

    @UseGuards(AuthGuard)
    @Post('/add-contact')
    addContact(
        @Body() body:{reciever:string},
        @Request() req:any
    ){
        return this.pendingService.addToContacts(req.user.sub || req.cookies.auth_token,body.reciever);
    }

    @UseGuards(AuthGuard)
    @Post('/accept')
    async accept(
        @Body() body:{sender:string},
        @Request() req:any
    ){
        return await this.pendingService.accept(req.user.sub|| req.cookies.auth_token,body.sender);
    }

    @UseGuards(AuthGuard)
    @Delete('/remove')
    async remove(
        @Body() body:{sender:string},
        @Request() req:any
    ){
        console.log({
            'sender':body.sender,
            'reciever' :req.user.sub
        });
        
        return await this.pendingService.removePending(req.user.sub|| req.cookies.auth_token, body.sender);
    }

}
