import { Controller, Post, UseGuards , Request, Body, UploadedFile, UseInterceptors, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {

    constructor(private groupService:GroupsService){}

    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('cover'))
    @Post('/create-group')
    async createGroup(@Request() req:any, @Body() body:{name:string,cover:string},@UploadedFile() file:Express.Multer.File){
        body.cover = file.filename;
        return this.groupService.createGroup(req.user.sub || req.cookies.auth_token ,body.name , body.cover);
    }


    @UseGuards(AuthGuard)
    @Post('/add-group-member/:groupId')
    async addMember(@Param('groupId') groupId:string,@Request() req:any ,@Body() body:{user_id:string}){
        return this.groupService.addMember(groupId,body.user_id);
    }

    @UseGuards(AuthGuard)
    @Get('/get-group-member/:groupId')
    async getMembers(@Param('groupId') groupId:string){
        return this.groupService.getGroupMembers(groupId);
    }

    @UseGuards(AuthGuard)
    @Get('/get-group-chat/:groupId')
    async getGroupMessages(@Param('groupId') groupId:number){
        return this.groupService.getGroupChat(groupId);
    }

    @UseGuards(AuthGuard)
    @Get('/get-groups')
    async getGroup(@Request() req:any){
        return this.groupService.getGroups(req.user.sub || req.cookies.auth_token);
    }

    @UseGuards(AuthGuard)
    @Post('/add-member-search')
    async addMemberSearch(@Body() body:{query:string ,group_id:number}){
        return this.groupService.addMembersSearch(body.query,body.group_id);
    }
}
