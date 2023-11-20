import { IsEmail, IsNotEmpty } from "class-validator";

export class sendMailPasswordDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    user: string
}
