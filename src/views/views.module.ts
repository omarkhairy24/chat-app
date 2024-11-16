import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { DatabaseService } from 'src/db/db.providers';

@Module({
  controllers: [ViewsController],
  providers:[DatabaseService,JwtService,UserService]
})
export class ViewsModule {}
