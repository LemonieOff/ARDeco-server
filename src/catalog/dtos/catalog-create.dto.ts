import {
    ArrayNotEmpty,
    IsArray,
    IsEmpty,
    IsIn,
    IsLowercase,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from "@nestjs/class-validator";
import { colors, rooms, styles } from "../values";

export class CatalogCreateDto {
    @IsEmpty()
    company: number;

    @IsOptional()
    @IsString()
    company_name: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    object_id: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    width: number;

    @IsNotEmpty()
    @IsNumber()
    height: number;

    @IsNotEmpty()
    @IsNumber()
    depth: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(colors, { each: true })
    colors: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(rooms, { each: true })
    rooms: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    @IsIn(styles, { each: true })
    styles: string[];

    // TODO : models
}
