import { IsEmail, IsNotEmpty, isNotEmpty } from "@nestjs/class-validator";

export class commandDto {
    pi_id: string;

    @IsEmail()
    @IsNotEmpty()
    mail: string;

    @IsNotEmpty()
    total_amount: number;

    @IsNotEmpty()
    total_excl_taxes: number;

    @IsNotEmpty()
    total_taxes: number;

    @IsNotEmpty()
    vat_rate: number;

    @IsNotEmpty()
    delivery_country: string;

    @IsNotEmpty()
    delivery_region: string;

    @IsNotEmpty()
    delivery_city: string;

    @IsNotEmpty()
    delivery_postal_code: string;

    @IsNotEmpty()
    delivery_adress_line_1: string;

    @IsNotEmpty()
    delivery_adress_line_2: string;

    @IsNotEmpty()
    delivery_complement: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    surname: string;

    @IsNotEmpty()
    payment_method: string;

    @IsNotEmpty()
    furniture: string;

    @IsNotEmpty()
    user_id: number;
}
