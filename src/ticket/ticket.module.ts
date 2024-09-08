import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "./models/ticket.entity";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket]),
        UserModule,
        JwtModule.register({
            secret: "secret"
        })
    ],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService]
})
export class TicketModule {}
