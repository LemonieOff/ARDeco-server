import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsIn,
    IsLowercase,
    IsNumber,
    IsOptional,
    IsString,
    Validate
} from "@nestjs/class-validator";
import { rooms, styles } from "../values";
import { CatalogColorValidator } from "../validators/catalog_color.validator";
import { ColorWithModelDto } from "./catalog-color-model.dto";

export class CatalogUpdateDto {
    @IsOptional()
    @IsString()
    company_name: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    object_id: string;

    @IsOptional()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    width: number;

    @IsOptional()
    @IsNumber()
    height: number;

    @IsOptional()
    @IsNumber()
    depth: number;

    @IsOptional()
    @IsBoolean()
    active: boolean;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @Validate(CatalogColorValidator)
    colors: (string | ColorWithModelDto)[];

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
