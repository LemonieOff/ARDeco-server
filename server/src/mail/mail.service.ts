import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";
import { Options } from "nodemailer/lib/smtp-transport";
import { sendMailDTO } from "./models/sendMail.dto";
import { sendMailPasswordDTO } from "./models/sendMailPassword";

// 296799252497-m015kpmeiedhi0lf9f442tdqe8q97djl.apps.googleusercontent.com
// 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
@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private readonly configService: ConfigService
    ) {}

    private async setTransport(token) {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            this.configService.get("CLIENT_ID"),
            this.configService.get("CLIENT_SECRET"),
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: token
        });

        const accessToken: string = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject("Failed to create access token");
                }
                resolve(token);
            });
        });

        const config: Options = {
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: this.configService.get("EMAIL"),
                clientId: this.configService.get("CLIENT_ID"),
                clientSecret: this.configService.get("CLIENT_SECRET"),
                accessToken
            }
        };
        this.mailerService.addTransporter("gmail", config);
    }

    public async sendMail(content : sendMailDTO) {
        await this.setTransport(await this.getToken());
        this.mailerService
            .sendMail({
                transporterName: "gmail",
                to: content.email, // list of receivers
                from: "noreply@nestjs.com", // sender address
                subject: "Bienvenue", // Subject line
                template: "./welcome",
                context: {
                    email: content.email,
                    user: content.user,
                },
            })
            .then(success => {
                console.log(success);
            })
            .catch(err => {
                console.log(err);
            });
    }

    public async sendMailPassword(content : sendMailPasswordDTO) {
        await this.setTransport(await this.getToken());
        this.mailerService
            .sendMail({
                transporterName: 'gmail',
                to: content.email, // list of receivers
                from: 'noreply@nestjs.com', // sender address
                subject: 'Change your ARDeco password', // Subject line
                template: './password',
                context: {
                    token : content.token,
                    user : content.user,
                },
            })
            .then((success) => {
                console.log(success);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    private async getToken(){
        const axios = require('axios');
        const qs = require('qs');
        let data = qs.stringify({
          'client_id': '296799252497-m015kpmeiedhi0lf9f442tdqe8q97djl.apps.googleusercontent.com',
          'client_secret': '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',
          'grant_type': 'refresh_token',
          'redirect_uri': 'https://localhost:8080',
          'refresh_token': '1//046DmH9P6nqf_CgYIARAAGAQSNwF-L9Ir_Hwq8PHcZUVvzc5S_ZYzyKQAv__wsdTogkxZZD5hWxbDXJm-lrw6joU7eXt92YdXWnY' 
        });
 
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://oauth2.googleapis.com/token?client_secret',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data : data
        };
 
 
        let t
        await axios.request(config)
        .then(async (response : any) => {
          console.log("Here : \n", response.data.access_token);
          console.log("Supposed token : ", response.data.access_token)
          t = response.data.access_token
        })
        .catch((error : any) => {
          console.log(error);
        });
        return await t
    }
}
