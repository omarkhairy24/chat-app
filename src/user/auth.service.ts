import { Injectable,BadRequestException, UnauthorizedException, NotAcceptableException } from '@nestjs/common';
import {DatabaseService} from '../db/db.providers';
import * as bcrybt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import { randomInt } from "crypto";
import {MailService} from '../mail/mail.service'
@Injectable()
export class AuthService {
  constructor(
    private db:DatabaseService,
    private jwtService:JwtService,
    private mailService:MailService
  ){}

  async signup(email:string,name:string,username:string,password:string){

    const checkEmail = await this.db.query(`SELECT email FROM users WHERE email = $1`,[email])
    if(checkEmail.rows.length > 0) throw new BadRequestException('this email already in use')
      const checkUsername = await this.db.query(`SELECT username FROM users WHERE username = $1`,[username])
    if(checkUsername.rows.length > 0) throw new BadRequestException('this username already in use')
    
    if(password.length < 8) throw new NotAcceptableException(' password must be at least 8 characters long. ');

    const attempts = 3
    const salt = await bcrybt.genSalt();
    const hash = await bcrybt.hash(password,salt);
    const otp = randomInt(100000, 999999).toString()
    const hashedOtp = await bcrybt.hash(otp,salt);

    try {
      this.mailService.sendVerificationEmail(email,'otp for chat app',otp);
      
      await this.db.query(`
        INSERT INTO register (email,name,username,password,otp,attempts)
        VALUES ($1,$2,$3,$4,$5,$6);
        `,[email,name,username,hash,hashedOtp,attempts]
      );
    } catch (error) {
      throw new BadRequestException(error)
    }
    
      return 'verification code sent to your email';
  }

  async verifyUser(email:string,otp:string){
    const user = await this.db.query(`SELECT * FROM register WHERE email = $1`,[email]);
    if(user.rows.length === 0) throw new BadRequestException('something went wrong');
    const attempts = user.rows[0].attempts;
    

    const checkOtp = await bcrybt.compare(otp , user.rows[0].otp);
    let remainingAttempts = attempts-1;

    if(!checkOtp){
      if (remainingAttempts === 0) {
        await this.db.query(`DELETE FROM register WHERE email = $1`,[email]);
        throw new BadRequestException('You have exhausted all attempts. Please request a new OTP.');
      }


      await this.db.query(`
        UPDATE register 
        SET attempts = $1
        WHERE email = $2
        `,[remainingAttempts ,email])
      
      throw new BadRequestException(`Incorrect OTP. You have ${remainingAttempts} attempts remaining.`);
    }

    await this.db.query(`
        INSERT INTO users (email,name,username,password)
        VALUES ($1,$2,$3,$4)
        RETURNING email,name,username;
      `,[user.rows[0].email ,user.rows[0].name,user.rows[0].username,user.rows[0].password]
    );

    await this.db.query(`DELETE FROM register WHERE email = $1`,[email]);

    return 'user created successfully'
  }

  async login(email:string,password:string){
    const user = await this.db.query(`SELECT id,username,email,password FROM users WHERE email = $1`,[email]);
    if(user.rows.length === 0) throw new BadRequestException('incorrect email or password');
    const isCorrectpassword = await bcrybt.compare(password,user.rows[0].password);
    if(!isCorrectpassword) throw new BadRequestException('incorrect email or password');
    const payload = { sub:user.rows[0].id, username:user.rows[0].username };
    const accessToken = await this.jwtService.signAsync(payload);
    return [{token:accessToken},{id:user.rows[0].id,email:user.rows[0].email,username:user.rows[0].username}];
  }

  async updatePassword(userId:string,oldPass:string,newPass:string){
    const user = await this.db.query(`SELECT id,password FROM users WHERE id = $1`,[userId]);
    if(user.rows.length === 0) throw new UnauthorizedException();
    const comparePassword = await bcrybt.compare(oldPass,user.rows[0].password);
    if(!comparePassword) throw new BadRequestException('incorrect password');
    const salt = await bcrybt.genSalt();
    const hash = await bcrybt.hash(newPass,salt);
    await this.db.query(`UPDATE users SET password = $2 WHERE id = $1`,[userId,hash]);
    return 'your password was updated successfully';
  }
}