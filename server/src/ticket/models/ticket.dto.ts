import { IsEmail, IsNotEmpty } from "class-validator";

export class TicketDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    message: string;
}
