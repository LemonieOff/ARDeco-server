import { ArrayNotEmpty, IsArray, IsIn, IsLowercase, IsNumber, IsOptional } from "@nestjs/class-validator";
import { colors, rooms, styles } from "../values";

export class CatalogFilterDto {
    @IsOptional()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(colors, { each: true })
    colors: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(rooms, { each: true })
    rooms: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(styles, { each: true })
    styles: string[];
}
