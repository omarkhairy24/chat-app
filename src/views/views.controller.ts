import { Controller,Get,Res,Render, Request } from '@nestjs/common';

@Controller('views')
export class ViewsController {

    @Get('/welcome')
    @Render('index')
    welcome(){
        return { title: 'Welcome'};
    }

    @Get('/signup')
    @Render('signup')
    GetSignup(){
        return;
    }

    @Get('/verify')
    @Render('verify')
    GetVerify(){
        return;
    }

    @Get('/login')
    @Render('login')
    getLogin(){
        return;
    }

    @Get('/home')
    getHome(@Request() req:any,@Res() res:any){
        if(!req.cookies?.auth_token) {
            return res.render('index');
        }
        return res.render('home',{title:'Home Page'});
    }
}
