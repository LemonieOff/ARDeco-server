import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRequestBody } from './models/PaymentsRequestBody';
import { Response } from 'express';
import { MailService } from 'src/mail/mail.service';
import { sendMailDTO } from 'src/mail/models/sendMail.dto';

@Controller("payments")
export class PaymentsController {
  constructor(
    private paymentService: PaymentsService,
    private mailService: MailService) { }

    @Get()
    createPayments(
        @Res() response: Response,
        @Body() paymentRequestBody: PaymentRequestBody
    ) {
        this.paymentService
            .createPayment(paymentRequestBody)
            .then(res => {
                response.status(HttpStatus.CREATED).json(res);
            })
            .catch(err => {
                response.status(HttpStatus.BAD_REQUEST).json(err);
            });
    }

    @Post()
    confirmPayments(@Body() pi_id) {
        console.log(pi_id);
        let content : sendMailDTO
        content.email = pi_id.email
        this.mailService.sendMail(pi_id.email);
        return this.paymentService.confirmPayment(pi_id.id)
    }
}
