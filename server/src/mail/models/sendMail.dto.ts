import { IsEmail, IsNotEmpty } from "class-validator";

export class sendMailDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    content: string;
}
