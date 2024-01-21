import { IsEmail, isNotEmpty, IsNotEmpty } from "class-validator";

export class sendMailInvoiceDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    id_invoice: number;

    @IsNotEmpty()
    name: number;

    @IsNotEmpty()
    total: number
}
