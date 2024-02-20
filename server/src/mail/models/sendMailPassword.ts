import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class sendMailPasswordDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    user: string
}
