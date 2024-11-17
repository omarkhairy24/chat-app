import { Controller,Get,Post,Body,Res, UseGuards, Patch, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import {UserService} from './user.service';
import {AuthService} from './auth.service';
import { Response } from 'express';
import { AuthGuard } from './guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private userService:UserService,
    private authService:AuthService
  ){}
  @Get('/allUsers')
  getUsers(){
    return this.userService.find();
  }

  @Post('/signup')
  signup(@Body() body:{email:string,name:string,username:string,password:string}){
    return this.authService.signup(body.email,body.name,body.username,body.password)
  }

  @Post('/signup/verify')
  verifyOtp(@Body() body:{email:string,otp:string}){
    return this.authService.verifyUser(body.email,body.otp)
  }

  @Post('/login')
  async login(@Body() body:{email:string,password:string}, @Res() res:Response){
    const login = await this.authService.login(body.email,body.password);
    res.cookie('auth_token', login[0].token, {
      httpOnly: true, 
      expires : new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ),
    });
    return res.status(200).json({ message: 'login successful',
      token:login[0].token
     });
  }

  @UseGuards(AuthGuard)
  @Post('/search')
  async search(@Body() body:{query:string},@Request() req:any){
    return this.userService.searchUser(body.query,req.user.sub || req.cookies.auth_token);
  }


  @UseGuards(AuthGuard)
  @Patch('/update-info')
  @UseInterceptors(FileInterceptor('image'))
  async updateInfo(@Request() req:any,
  @Body() body:{name:string,image:string},
  @UploadedFile() file:Express.Multer.File){
    if(file) body.image = file.filename;
    return await this.userService.updateUserInfo(req.user.sub || req.cookies.auth_token 
      ,body.name,body.image);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getMe(@Request() req:any){
    return this.userService.getMe(req.user.sub || req.cookies.auth_token);
  }

  @UseGuards(AuthGuard)
  @Patch('/update-password')
  updatePassword(@Body() body:{oldPassword:string,newPassword:string},@Request() req:any){
    return this.authService.updatePassword(
      req.user.sub||req.cookies.auth_token,
      body.oldPassword,
      body.newPassword);
  }
}
