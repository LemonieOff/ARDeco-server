import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Ticket } from './models/ticket.entity';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {User} from "../user/models/user.entity";
import {Gallery} from "../gallery/models/gallery.entity";

@Controller('ticket')
export class TicketController {
    constructor(
        private ticketService: TicketService,
        private jwtService: JwtService,
    ) {
    }

    @Get()
    all() {
        return ['tickets'];
    }

    @Get(':id')
    async getOne(@Param('id') id: number) {
        const requestedTicket = await this.ticketService.findOne({id: id});
        console.log(requestedTicket);
        if (requestedTicket === undefined || requestedTicket === null) {
            return {
                status: 'KO',
                code: 404,
                description: 'Ticket was not found',
                error: 'Ticket was not found',
                data: null,
            };
        }
        return {
            status: 'OK',
            code: 200,
            description: 'Ticket has been found',
            data: {
                id: requestedTicket.id,
                messages: requestedTicket.messages,
            },
        };
    }

    @UseGuards(AuthGuard)
    @Get('whoami')
    async whoami(@Req() request: Request) {
        const cookie = request.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);
        return this.ticketService.findOne({id: data['id']});
    }


    @UseGuards(AuthGuard)
    @Put(':id')
    async editViaParam(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(ticket);
        return await this.editTicket(req, id, ticket, res);
    }

    async editTicket(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<Ticket>,
        res: Response,
    ) {
        try {
            const item = await this.ticketService.findOne({id: id});
            const result = await this.ticketService.update(id, new_item);
            res.status(200);
            return {
                status: 'OK',
                code: 200,
                description: 'Ticket was updated',
                data: result,
            };
        } catch (e) {
            res.status(400);
            return {
                status: 'KO',
                code: 400,
                description: 'Ticket was not updated because of an error',
                error: e,
                data: null,
            };
        }
    }

    @UseGuards(AuthGuard)
    @Put('close/:id')
    async closeTicket(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(ticket);

        ticket.status = "closed";
        return await this.editTicket(req, id, ticket, res);
    }

    @UseGuards(AuthGuard)
    @Put('write/:id')
    async writeMessage(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(ticket);
        const requestedTicket = await this.ticketService.findOne({id: id});
        ticket.messages = requestedTicket.messages = requestedTicket.messages.slice(0, -1) + "message" + "]";
        return await this.editTicket(req, id, ticket, res);
    }
}
