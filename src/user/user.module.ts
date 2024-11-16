import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import {AuthService} from './auth.service';
import {DatabaseService} from '../db/db.providers';
import { UserController } from './user.controller';
import {JwtModule} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
        signOptions: { expiresIn: '90d' },
      }),
    }),
    MulterModule.register({
      storage:diskStorage({
        destination:'public/users',
        filename:(req,file,cb) =>{
          cb(null,`${Date.now()}-${file.originalname}`)
        }
      })
    })
  ],
  providers: [UserService,DatabaseService,AuthService,MailService],
  controllers: [UserController]
})
export class UserModule {}
