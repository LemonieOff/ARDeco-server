import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRequestBody } from './models/PaymentsRequestBody';
import { Response, Request } from 'express';
// import { MailService } from 'src/mail/mail.service';
import { sendMailDTO } from 'src/mail/models/sendMail.dto';
import { commandDto } from './models/command.dto';
import { Command } from './models/command.entity';

@Controller("payments")
export class PaymentsController {
  constructor(
    private paymentService: PaymentsService,
    // private mailService: MailService
  ) { }

    @Get()
    async createPayments(
        @Res() response: Response,
        @Body() c_dto: commandDto
    ) {
        this.paymentService
            .createPayment(c_dto)
            .then(res => {
                response.status(HttpStatus.CREATED).json(res);
            })
            .catch(err => {
                response.status(HttpStatus.BAD_REQUEST).json(err);
            });
    }

    @Get("all")
    async getAll() {
        return this.paymentService.all()
    }

    @Post("invoice")
    async generateInvoice
    (
        @Body() id
    ) {
        console.log("ID : ", id.id);
        await this.paymentService.createInvoice(id.id)
    }

    @Post()
    async confirmPayments (
        @Body() c_dto: commandDto,
        @Res({ passthrough: true }) resp: Response
    ) 
    {
        if (!c_dto.pi_id) {
            resp.status(404)
            return {
                status: "KO",
                code: 404,
                description: "No pi_id given",
                data: null
            };
        }
        let content : sendMailDTO = new sendMailDTO()
        content.email = c_dto.mail
        let dtoToMail :sendMailDTO = new sendMailDTO()
        dtoToMail.email = c_dto.mail
        dtoToMail.user = c_dto.name

        //this.mailService.sendMail(dtoToMail);

        let newOrder: Command = new Command()
        newOrder.delivery_adress_line_1 = c_dto.delivery_adress_line_1
        newOrder.delivery_adress_line_2 = c_dto.delivery_adress_line_2
        newOrder.delivery_city = c_dto.delivery_city
        newOrder.delivery_complement = c_dto.delivery_complement
        newOrder.delivery_country = c_dto.delivery_country
        newOrder.delivery_postal_code = c_dto.delivery_postal_code
        newOrder.delivery_region = c_dto.delivery_region
        newOrder.furniture = c_dto.furniture
        newOrder.name  = c_dto.name
        newOrder.payment_method = c_dto.payment_method
        newOrder.surname =  c_dto.surname
        newOrder.total_amount = c_dto.total_amount
        newOrder.total_excl_taxes = c_dto.total_excl_taxes
        newOrder.total_taxes = c_dto.total_taxes
        newOrder.vat_rate = c_dto.vat_rate
        newOrder.user_id = c_dto.user_id
        let order = await this.paymentService.create(newOrder)
        resp.status(200)
        return {
            status: "OK",
            code: 200,
            data: await this.paymentService.confirmPayment(c_dto.pi_id, order, c_dto.mail)
        };
    }
}
