import { Injectable,CanActivate,ExecutionContext,UnauthorizedException, flatten,NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {UserService} from '../user.service'
import { Request } from "express";
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(
    private jwtService:JwtService,
    private userService:UserService,
    private config:ConfigService
  ){}

  async canActivate(context:ExecutionContext):Promise<boolean>{
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if(!token) throw new UnauthorizedException('no token provided');
    try {

      const payload = await this.jwtService.verifyAsync(token,{
        secret:this.config.get('jwtSecret')
      });

      request['user'] = payload;

    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractToken(req: Request): string | undefined {
    // First, try to extract from Authorization header
    const headerToken = this.extractTokenFromHeader(req);
    if (headerToken) return headerToken;

    // If not in header, try to extract from cookies
    return req.cookies?.auth_token;
  }

  private extractTokenFromHeader(req:Request){
    const [type,token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
