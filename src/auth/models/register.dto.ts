import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    password_confirm: string;

    @IsNotEmpty()
    first_name: string;

    city: string;

    last_name: string;

    phone: string;
}
