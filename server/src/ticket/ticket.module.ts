import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket]),
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService]

})
export class UserModule {}
