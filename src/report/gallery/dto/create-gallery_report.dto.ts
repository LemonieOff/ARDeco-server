import { IsEnum, IsNumber, IsString } from "@nestjs/class-validator";

export class CreateGalleryReportDto {
    @IsNumber()
    gallery_id: number;

    @IsNumber()
    user_id: number;

    @IsEnum(["open", "close", "deleted"])
    status: string;

    @IsString()
    report_text: string;
}
