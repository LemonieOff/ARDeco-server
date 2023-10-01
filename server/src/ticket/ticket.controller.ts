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

@Controller('ticket')
export class TicketController {
    constructor(
        private ticketService: TicketService,
        private jwtService: JwtService,
    ) {}

    @Get()
    all() {
        return ['users'];
    }

    @Get(':id')
    async getOne(@Param('id') id: number) {
        const requestedUser = await this.ticketService.findOne({ id: id });
        console.log(requestedUser);
        if (requestedUser === undefined || requestedUser === null) {
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
                id: requestedUser.id,
            },
        };
    }
    @UseGuards(AuthGuard)
    @Get('whoami')
    async whoami(@Req() request: Request) {
        const cookie = request.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);
        return this.ticketService.findOne({ id: data['id'] });
    }
}
