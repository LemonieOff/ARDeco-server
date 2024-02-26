import {
    Body,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import {TicketService} from './ticket.service';
import {UserService} from 'src/user/user.service';
import {Request, Response} from 'express';
import {AuthGuard} from '../auth/auth.guard';
import {JwtService} from '@nestjs/jwt';
import {Ticket} from './models/ticket.entity';
import {QueryPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {TicketDto} from "./models/ticket.dto";

@Controller('ticket')
export class TicketController {
    constructor(
        private ticketService: TicketService,
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

  //  @UseGuards(AuthGuard)
    @Get('pending')
    async getPending(@Req() req: Request): Promise<any> {
        console.log(req.cookies);
        console.log("jwt in cookie is " + req.cookies['jwt']);
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        console.log(data);
        const usr = await this.userService.findOne({id: data['id']})
        console.log("User", usr);
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }

        const tickets = await this.ticketService.all()
        let res = []
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                res.push(tickets[i])
            }
        }
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'All pending tickets',
            data: res,
        };
    }

   // @UseGuards(AuthGuard)
    @Get('random')
    async getRandom(@Req() req: Request): Promise<any> {
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})
        console.log("User", usr);
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }

        const tickets = await this.ticketService.all()
        let res = []
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                res.push(tickets[i])
            }
        }
        if (res.length == 0) {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'No pending tickets',
                data: null,
            };
        }
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Random pending ticket',
            data: res[Math.floor(Math.random() * res.length)],
        };
    }

   // @UseGuards(AuthGuard)
    @Get('stats')
    async getStats(@Req() req: Request): Promise<any> {
        console.log(req.cookies);
        console.log("jwt in cookie is " + req.cookies['jwt']);
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        console.log(data);
        const usr = await this.userService.findOne({id: data['id']})
        console.log("User", usr);
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }

        const tickets = await this.ticketService.all()
        let pending = 0
        let closed = 0
        let deleted = 0
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                pending++
            }
            else if (tickets[i].status == "closed") {
                closed++
            }
            else if (tickets[i].status == "deleted") {
                deleted++
            }
        }
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Stats',
            data: {
                pending: pending,
                closed: closed,
                deleted: deleted,
            },
        };
    }

    //@UseGuards(AuthGuard)
    @Get('stats/last7days')
    async getStatsLast7Days(@Req() req: Request): Promise<any> {
        console.log(req.cookies);
        console.log("jwt in cookie is " + req.cookies['jwt']);
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        console.log(data);
        const usr = await this.userService.findOne({id: data['id']})
        console.log("User", usr);
        console.log("Role", usr.role);
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }
        const tickets = await this.ticketService.all()
        let todayTickets = 0
        let yesterdayTickets = 0
        let twoDaysAgoTickets = 0
        let threeDaysAgoTickets = 0
        let fourDaysAgoTickets = 0
        let fiveDaysAgoTickets = 0
        let sixDaysAgoTickets = 0
        let today = new Date()
        for (let i = 0; i < tickets.length; i++) {
            let ticketDate = new Date(tickets[i].date)
            if (ticketDate.getDate() == today.getDate()) {
                todayTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 1) {
                yesterdayTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 2) {
                twoDaysAgoTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 3) {
                threeDaysAgoTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 4) {
                fourDaysAgoTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 5) {
                fiveDaysAgoTickets++
            }
            else if (ticketDate.getDate() == today.getDate() - 6) {
                sixDaysAgoTickets++
            }
        }
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Stats',
            data: {
                days: {
                    today: todayTickets,
                    yesterday: yesterdayTickets,
                    twoDaysAgo: twoDaysAgoTickets,
                    threeDaysAgo: threeDaysAgoTickets,
                    fourDaysAgo: fourDaysAgoTickets,
                    fiveDaysAgo: fiveDaysAgoTickets,
                    sixDaysAgo: sixDaysAgoTickets,
                },
                total: todayTickets + yesterdayTickets + twoDaysAgoTickets + threeDaysAgoTickets + fourDaysAgoTickets + fiveDaysAgoTickets + sixDaysAgoTickets,
            }
        }
    }




    @Get()
    all() {
        return ['tickets'];
    }



    @Get(':id')
    async getOne(@Param('id') id: number,
                 @Req() req: Request): Promise<any> {
        const requestedTicket = await this.ticketService.findOne({ id });
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})

        if (!requestedTicket) {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'Ticket was not found',
                data: null,
            };
        }
        else if (requestedTicket.status == "deleted" && usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'Ticket is deleted',
                data: null,
            };
        }
        else if (usr.id != requestedTicket.user_init_id && usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not the owner of this ticket',
                data: null,
            };
        }
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Ticket has been found',
            data: {
                id: requestedTicket.id,
                messages: requestedTicket.messages,
            },
        };
    }

    //@UseGuards(AuthGuard)
    @Get('whoami')
    async whoami(@Req() request: Request): Promise<any> {
        const cookie = request.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);
        return this.ticketService.findOne({ id: data['id'] });
    }

    //@UseGuards(AuthGuard)
    @Put(':id')
    async editViaParam(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response,
    ) {
        return await this.editTicket(req, id, ticket, res);
    }

    private async editTicket(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<Ticket>,
        res: Response,
    ): Promise<any> {
        try {
            const result = await this.ticketService.update(id, new_item);
            return {
                status: 'OK',
                code: HttpStatus.OK,
                description: 'Ticket was updated',
                data: result,
            };
        } catch (e) {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'Ticket was not updated because of an error',
                error: e,
                data: null,
            };
        }
    }

    //@UseGuards(AuthGuard)
    @Put('close/:id')
    async closeTicket(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response,
    ) {
        //check admin
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }
        ticket.status = "closed";
        return await this.editTicket(req, id, ticket, res);
    }

    //@UseGuards(AuthGuard)
    @Put('delete/:id')
    async delete(@Param('id') id: number,
                 @Req() req: Request,
                 @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})
        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }
        const ticket = await this.ticketService.findOne({ id })
        ticket.status = "deleted";
        return await this.editTicket(req, id, ticket, res);
    }

    //@UseGuards(AuthGuard)
    @Post('create')
    async createTicket(
        @Req() req: Request,
        @Body() ticket: TicketDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})
        const body = {
            "title": ticket.title,
            "description": ticket.description,
            "messages": "[{\"sender\": \"" + usr.first_name + " " + usr.last_name + "\", \"content\": \"" + ticket.message + "\", \"timestamp\": \"" + Date.now().toLocaleString() + "\"}]",
            "user_init_id": usr.id,
            "status": "pending",
            //QueryFailedError: Incorrect datetime value: '1697831975703' for column 'date' at row 1
            //  "date": Date.now()

        }
        const ress = await this.ticketService.create(body)
        console.log("ID", ress.id)
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Ticket was created',
            data: ress,
        };
    }

    //@UseGuards(AuthGuard)
    @Put('write/:id')
    async writeTicket(
        @Req() req: Request,
        @Param('id') id: number,
        @Body('message') message: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})
        const ticket = await this.ticketService.findOne({id: id})

        try {
            if (!ticket) {
                return {
                    status: 'KO',
                    code: HttpStatus.BAD_REQUEST,
                    description: 'Ticket was not found',
                    data: null,
                };
            }
            else if (ticket.status == "closed") {
                return {
                    status: 'KO',
                    code: HttpStatus.BAD_REQUEST,
                    description: 'Ticket is closed',
                    data: null,
                };
            }
            else if (ticket.status == "deleted") {
                return {
                    status: 'KO',
                    code: HttpStatus.BAD_REQUEST,
                    description: 'Ticket is deleted',
                    data: null,
                };
            }
            else if (usr.id != ticket.user_init_id && usr.role != "admin") {
                return {
                    status: 'KO',
                    code: HttpStatus.BAD_REQUEST,
                    description: 'You are not the owner of this ticket',
                    data: null,
                };
            }
            else if (message.length == 0) {
                return {
                    status: 'KO',
                    code: HttpStatus.BAD_REQUEST,
                    description: 'Message is empty',
                    data: null,
                };
            }
        } catch (e) {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'Ticket was not edited because of an error',
                data: null,
            };
        }

        let messages = ticket.messages
        console.log("Messages", JSON.stringify(messages));
        if (usr.role == "admin") {
            messages = messages.slice(0, -1) + ",{\"sender\": \"" + "Support" + "\", \"content\": \"" + message + "\", \"timestamp\": \"" + Date.now().toLocaleString() + "\"}]"
        }
        else messages = messages.slice(0, -1) + ",{\"sender\": \"" + usr.first_name + " " + usr.last_name + "\", \"content\": \"" + message + "\", \"timestamp\": \"" + Date.now().toLocaleString() + "\"}]"
        const body = {
            "messages": messages
        }
        const ress = await this.ticketService.update(id, body)
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Message was added to ticket',
            data: ress,
        };
    }

    //@UseGuards(AuthGuard)
    @Get('all')
    async getAll(@Req() req: Request): Promise<any> {
        const data = await this.jwtService.verifyAsync(req.cookies['jwt'])
        const usr = await this.userService.findOne({id: data['id']})

        if (usr.role != "admin") {
            return {
                status: 'KO',
                code: HttpStatus.BAD_REQUEST,
                description: 'You are not an admin',
                data: null,
            };
        }

        const tickets = await this.ticketService.all()
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'All tickets',
            data: tickets,
        };
    }
}


