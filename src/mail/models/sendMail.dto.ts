import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class sendMailDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    user: string;
}
