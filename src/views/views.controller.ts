import { Controller,Get,Res,Render, Request, Post } from '@nestjs/common';

@Controller('views')
export class ViewsController {

    @Get('/welcome')
    welcome(@Request() req:any,@Res() res:any){
        if(req.cookies?.auth_token) {
            return res.render('home',{title:'Home Page'});
        }
        return res.render('index',{title:'welcome'});
    }

    @Get('/signup')
    GetSignup(@Request() req:any,@Res() res:any){
        if(req.cookies?.auth_token) {
            return res.render('home',{title:'Home Page'});
        }
        return res.render('signup',{title:'signup'});
    }

    @Get('/verify')
    GetVerify(@Request() req:any,@Res() res:any){
        if(req.cookies?.auth_token) {
            return res.render('home',{title:'Home Page'});
        }
        return res.render('verify',{title:'verify'});
    }

    @Get('/login')
    getLogin(@Request() req:any,@Res() res:any){
        if(req.cookies?.auth_token) {
            return res.render('home',{title:'Home Page'});
        }
        return res.render('login',{title:'login'});
    }

    @Get('/home')
    getHome(@Request() req:any,@Res() res:any){
        if(!req.cookies?.auth_token) {
            return res.render('index');
        }
        return res.render('home',{title:'Home Page'});
    }
    
}
