import {
    ArrayNotEmpty,
    IsArray,
    IsEmpty,
    IsLowercase,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from "@nestjs/class-validator";

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
    colors: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    rooms: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    styles: string[];

    // TODO : models
}
