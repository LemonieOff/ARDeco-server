import { IsNotEmpty, IsNumber, IsPositive, Min } from "@nestjs/class-validator";

export class AddItemToCartDTO {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    furniture_id: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    model_id: number;
}
