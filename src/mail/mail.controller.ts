/*
import { Body, Controller, Get } from "@nestjs/common";
import { MailService } from "./mail.service";
import { sendMailDTO } from "./models/sendMail.dto";
import { sendMailInvoiceDTO } from "./models/sendMailInvoice.dto";
import { sendMailPasswordDTO } from "./models/sendMailPassword";

@Controller("mail")
export class MailController {
    constructor(private mailService: MailService) {}

    @Get('welcome')
    welcome(@Body() sendMailWelcome: sendMailDTO) {
        this.mailService.sendMail(sendMailWelcome)
        return 'send'
    }

    @Get('password')
    password(@Body() sendMailPass: sendMailPasswordDTO) {
        this.mailService.sendMailPassword(sendMailPass)
        return 'send'
    }

    @Get('invoice')
    invoice(@Body() sendMailPass: sendMailInvoiceDTO) {
        this.mailService.sendMailInvoice(sendMailPass)
        return 'send'
    }
}
*/
