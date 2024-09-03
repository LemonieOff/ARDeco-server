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
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    colors: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    rooms: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsLowercase({ each: true })
    styles: string[];

    // TODO : models
}
