import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter : nodemailer.Transporter
    constructor(private configService:ConfigService){
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            host:this.configService.get('mailhost'),
            port:+this.configService.get('mailport'),
            secure:false,
            auth:{
                user:this.configService.get('user'),
                pass:this.configService.get('pass')
            }
        })
    }

    async sendVerificationEmail(email: string, subject: string, text: string) {
		const mailOptions = {
			from: 'admin',
			to: email,
			subject,
			text,
		};

		await this.transporter.sendMail(mailOptions);
    }
}
