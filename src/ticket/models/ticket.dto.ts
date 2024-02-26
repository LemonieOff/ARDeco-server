import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class TicketDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    message: string;
}
