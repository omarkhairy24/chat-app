import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { DatabaseService } from 'src/db/db.providers';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports:[
    MulterModule.register({
      storage:diskStorage({
        destination:'public/group',
        filename:(req,file,cb) =>{
          cb(null,`${Date.now()}-${file.originalname}`)
        }
      })
    })
  ],
  providers: [GroupsService,DatabaseService,JwtService,UserService],
  controllers: [GroupsController]
})
export class GroupsModule {}
