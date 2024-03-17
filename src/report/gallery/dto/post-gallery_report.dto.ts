import { IsOptional, IsString } from "@nestjs/class-validator";

export class PostGalleryReportDto {
    @IsOptional()
    @IsString()
    report_text: string | null;
}
