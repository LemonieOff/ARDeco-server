import { Controller, Get, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { sendMailDTO } from './models/sendMail.dto';

@Controller('mail')
export class MailController {
    constructor(private mailService:MailService) {}

    @Get()
    basic(@Body() sendMail: sendMailDTO) {
        this.mailService.sendMail(sendMail.email, "random")
        return 'send'
    }
}
