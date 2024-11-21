import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res } from "@nestjs/common";
import { TicketService } from "./ticket.service";
import { UserService } from "src/user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Ticket } from "./models/ticket.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { TicketDto } from "./models/ticket.dto";

@Controller("ticket")
export class TicketController {
    constructor(
        private ticketService: TicketService,
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Get("all")
    async getAll(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (usr.role != "admin") {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not an admin",
                data: null
            };
        }

        const tickets = await this.ticketService.all();
        for (const ticket of tickets) {
            ticket.messages = ticket.messages = await this.changeUserSenderToRealName(ticket.messages, ticket.user_id);
        }
        console.log(tickets);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "All tickets",
            data: tickets
        };
    }

    @Get("pending")
    async getPending(@Req() req: Request, @Res({ passthrough: true }) httpRes: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            httpRes.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            httpRes.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (usr.role != "admin") {
            httpRes.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not an admin",
                data: null
            };
        }

        const tickets = await this.ticketService.all();
        let res = [];
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                tickets[i].messages = tickets[i].messages = await this.changeUserSenderToRealName(tickets[i].messages, tickets[i].user_id);
                res.push(tickets[i]);
            }
        }

        httpRes.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "All pending tickets",
            data: res
        };
    }

    @Get("random")
    async getRandom(@Req() req: Request, @Res({ passthrough: true }) httpRes: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            httpRes.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            httpRes.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (usr.role != "admin") {
            httpRes.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not an admin",
                data: null
            };
        }

        const tickets = await this.ticketService.all();
        let res = [];
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                tickets[i].messages = tickets[i].messages = await this.changeUserSenderToRealName(tickets[i].messages, tickets[i].user_id);
                res.push(tickets[i]);
            }
        }
        if (res.length == 0) {
            httpRes.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "No pending tickets",
                data: null
            };
        }

        httpRes.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Random pending ticket",
            data: res[Math.floor(Math.random() * res.length)]
        };
    }

    @Get("stats")
    async getStats(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        // Check user exists
        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        // Check user is admin
        if (usr.role !== "admin") {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not an admin",
                data: null
            };
        }

        const tickets = await this.ticketService.all();
        let pending = 0;
        let closed = 0;
        let deleted = 0;
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].status == "pending") {
                pending++;
            } else if (tickets[i].status == "closed") {
                closed++;
            } else if (tickets[i].status == "deleted") {
                deleted++;
            }
        }

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Stats",
            data: {
                pending: pending,
                closed: closed,
                deleted: deleted
            }
        };
    }

    @Get("stats/last7days")
    async getStatsLast7Days(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (usr.role != "admin") {
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not an admin",
                data: null
            };
        }

        const tickets = await this.ticketService.all();
        let todayTickets = 0;
        let yesterdayTickets = 0;
        let twoDaysAgoTickets = 0;
        let threeDaysAgoTickets = 0;
        let fourDaysAgoTickets = 0;
        let fiveDaysAgoTickets = 0;
        let sixDaysAgoTickets = 0;
        let today = new Date();
        for (let i = 0; i < tickets.length; i++) {
            let ticketDate = new Date(tickets[i].date);
            if (ticketDate.getDate() == today.getDate()) {
                todayTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 1) {
                yesterdayTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 2) {
                twoDaysAgoTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 3) {
                threeDaysAgoTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 4) {
                fourDaysAgoTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 5) {
                fiveDaysAgoTickets++;
            } else if (ticketDate.getDate() == today.getDate() - 6) {
                sixDaysAgoTickets++;
            }
        }

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Stats",
            data: {
                days: {
                    today: todayTickets,
                    yesterday: yesterdayTickets,
                    twoDaysAgo: twoDaysAgoTickets,
                    threeDaysAgo: threeDaysAgoTickets,
                    fourDaysAgo: fourDaysAgoTickets,
                    fiveDaysAgo: fiveDaysAgoTickets,
                    sixDaysAgo: sixDaysAgoTickets
                },
                total: todayTickets + yesterdayTickets + twoDaysAgoTickets + threeDaysAgoTickets + fourDaysAgoTickets + fiveDaysAgoTickets + sixDaysAgoTickets
            }
        };
    }

    @Get(":id")
    async getOne(@Param("id") id: number,
                 @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<any> {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        const requestedTicket = await this.ticketService.findOne({ id });
        console.log(requestedTicket);
        if (!requestedTicket) {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "Ticket was not found",
                data: null
            };
        } else if (requestedTicket.status == "deleted" && usr.role != "admin") {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "Ticket is deleted",
                data: null
            };
        } else if (usr.id != requestedTicket.user_id && usr.role != "admin") {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not the owner of this ticket",
                data: null
            };
        }

        requestedTicket.messages = await this.changeUserSenderToRealName(requestedTicket.messages, requestedTicket.user_id);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Ticket has been found",
            data: {
                id: requestedTicket.id,
                title: requestedTicket.title,
                description: requestedTicket.description,
                status: requestedTicket.status,
                messages: JSON.parse(requestedTicket.messages)
            }
        };
    }

    @Get("/user/:user_id")
    async getViaUser(
        @Param("user_id") user_id: number,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response): Promise<any> {
        user_id = Number(user_id);
        if (isNaN(user_id)) {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "User ID is not a number",
                data: null
            };
        }

        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });
        if (!user) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (user.id !== user_id && user.role !== "admin") {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not an admin nor the owner of the targeted account",
                data: null
            };
        }

        const tickets = await this.ticketService.allForUser(user_id);
        for (const ticket of tickets) {
            ticket.messages = await this.changeUserSenderToRealName(ticket.messages, ticket.user_id);
        }
        //const tickets_ids = tickets.map((ticket) => ticket.id);

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "All tickets for user " + user_id,
            data: tickets
        };
    }

    @Put(":id")
    async editViaParam(
        @Req() req: Request,
        @Param("id") id: number,
        @Body() ticket: QueryPartialEntity<Ticket>,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.editTicket(req, id, ticket, res);
    }

    @Put("close/:id")
    async closeTicket(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        // Check user exists
        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        // Check ticket exists
        const ticket = await this.ticketService.findOne({ id });
        if (!ticket) {
            res.status(HttpStatus.NOT_FOUND);
            return {
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Ticket not found",
                data: null
            };
        }

        if (ticket.status === "deleted") {
            res.status(HttpStatus.NOT_FOUND);
            return {
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Ticket is deleted",
                data: null
            };
        }

        if (usr.id !== ticket.user_id && usr.role != "admin") {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not an admin nor the owner of this ticket",
                data: null
            };
        }

        if (ticket.status === "closed") {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "Ticket is already closed",
                data: null
            };
        }

        ticket.status = "closed";
        const result = await this.editTicket(req, id, ticket, res);

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Ticket was closed",
            data: null
        };
    }

    @Put("delete/:id")
    async delete(@Param("id") id: number,
                 @Req() req: Request,
                 @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }
        if (usr.role !== "admin") {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not an admin",
                data: null
            };
        }

        const ticket = await this.ticketService.findOne({ id });
        if (!ticket) {
            res.status(HttpStatus.NOT_FOUND);
            return {
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Ticket not found",
                data: null
            };
        }

        if (ticket.status === "deleted") {
            res.status(HttpStatus.NOT_FOUND);
            return {
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Ticket is already deleted",
                data: null
            };
        }

        ticket.status = "deleted";
        const result = await this.editTicket(req, id, ticket, res);

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Ticket was deleted",
            data: null
        };
    }

    @Post("create")
    async createTicket(
        @Req() req: Request,
        @Body() ticket: TicketDto,
        @Res({ passthrough: true }) res: Response
    ) {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        const ticketTmp: Ticket = new Ticket();
        ticketTmp.title = ticket.title;
        ticketTmp.description = ticket.description;
        ticketTmp.messages = JSON.stringify([{
            sender: "User",
            content: ticket.message,
            timestamp: Date.now().toLocaleString()
        }]);
        ticketTmp.user_id = usr.id;
        ticketTmp.status = "pending";

        const ress = await this.ticketService.create(ticketTmp);
        ress.messages = await this.changeUserSenderToRealName(ress.messages, ress.user_id);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Ticket was created",
            data: ress
        };
    }

    @Put("write/:id")
    async writeTicket(
        @Req() req: Request,
        @Param("id") id: number,
        @Body("message") message: string,
        @Res({ passthrough: true }) res: Response
    ) {
        // Check login
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        const ticket = await this.ticketService.findOne({ id: id });
        try {
            if (!ticket) {
                res.status(HttpStatus.BAD_REQUEST);
                return {
                    status: "KO",
                    code: HttpStatus.BAD_REQUEST,
                    description: "Ticket was not found",
                    data: null
                };
            } else if (ticket.status == "closed") {
                res.status(HttpStatus.BAD_REQUEST);
                return {
                    status: "KO",
                    code: HttpStatus.BAD_REQUEST,
                    description: "Ticket is closed",
                    data: null
                };
            } else if (ticket.status == "deleted") {
                res.status(HttpStatus.BAD_REQUEST);
                return {
                    status: "KO",
                    code: HttpStatus.BAD_REQUEST,
                    description: "Ticket is deleted",
                    data: null
                };
            } else if (usr.id != ticket.user_id && usr.role != "admin") {
                res.status(HttpStatus.BAD_REQUEST);
                return {
                    status: "KO",
                    code: HttpStatus.BAD_REQUEST,
                    description: "You are not the owner of this ticket",
                    data: null
                };
            } else if (message.length == 0) {
                res.status(HttpStatus.BAD_REQUEST);
                return {
                    status: "KO",
                    code: HttpStatus.BAD_REQUEST,
                    description: "Message is empty",
                    data: null
                };
            }
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "Ticket was not edited because of an error",
                data: null
            };
        }

        let messages: [{ sender: string, content: string, timestamp: string }] = JSON.parse(ticket.messages);
        if (usr.role == "admin") {
            messages.push({
                sender: "Support",
                content: message,
                timestamp: Date.now().toLocaleString()
            });
        } else {
            messages.push({
                sender: "User",
                content: message,
                timestamp: Date.now().toLocaleString()
            });
        }
        ticket.messages = JSON.stringify(messages);

        const ress = await this.ticketService.update(id, ticket);
        ress.messages = await this.changeUserSenderToRealName(ress.messages, ress.user_id);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Message was added to ticket",
            data: ress
        };
    }

    private async editTicket(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<Ticket>,
        res: Response
    ): Promise<any> {
        try {
            const result = await this.ticketService.update(id, new_item);
            res.status(HttpStatus.OK);
            return {
                status: "OK",
                code: HttpStatus.OK,
                description: "Ticket was updated",
                data: result
            };
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "Ticket was not updated because of an error",
                error: e,
                data: null
            };
        }
    }

    private async changeUserSenderToRealName(messages_string: string, user_id: number) {
        const author = await this.userService.findOne({ id: user_id });
        const messages: [{ sender: string, content: string, timestamp: string }] = JSON.parse(messages_string);

        return JSON.stringify(messages.map((message) => ({
            ...message,
            sender: message.sender === "Support" ? "Support" : `${author.first_name} ${author.last_name}`
        })));
    }
}


