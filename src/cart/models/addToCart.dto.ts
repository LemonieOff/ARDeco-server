import { IsNotEmpty, IsNumber, IsPositive } from "@nestjs/class-validator";

export class AddItemToCartDTO {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    furniture_id: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    model_id: number;
}
