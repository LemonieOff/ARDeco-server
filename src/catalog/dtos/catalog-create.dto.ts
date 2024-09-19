import {
    ArrayNotEmpty,
    IsArray,
    IsEmpty,
    IsIn,
    IsLowercase,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Validate
} from "@nestjs/class-validator";
import { rooms, styles } from "../values";
import { ColorWithModelDto } from "./catalog-color-model.dto";
import { CatalogColorValidator } from "../validators/catalog_color.validator";

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
    @Validate(CatalogColorValidator)
    colors: (string | ColorWithModelDto)[];

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
}
