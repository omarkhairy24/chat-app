import { Module } from '@nestjs/common';
import { PendingService } from './pending.service';
import { PendingController } from './pending.controller';
import { DatabaseService } from 'src/db/db.providers';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Module({
  imports:[

  ],
  providers: [PendingService,DatabaseService,JwtService,UserService],
  controllers: [PendingController]
})
export class PendingModule {}
