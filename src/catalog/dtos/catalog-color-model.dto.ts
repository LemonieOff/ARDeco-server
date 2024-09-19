import { IsIn, IsLowercase, IsNumber, IsOptional } from "@nestjs/class-validator";
import { colors } from "../values";

export class ColorWithModelDto {
    @IsLowercase()
    @IsIn(colors)
    color: string;

    @IsOptional()
    @IsNumber()
    model_id: number;
}
