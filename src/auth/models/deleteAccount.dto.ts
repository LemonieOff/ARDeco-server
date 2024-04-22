import { Equals, IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class DeleteAccountDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    password_confirm: string;
}
