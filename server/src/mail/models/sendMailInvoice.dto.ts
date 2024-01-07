import { IsEmail, IsNotEmpty } from "class-validator";

export class sendMailPasswordDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    id_invoice: number;
}
