import { PartialType } from "@nestjs/mapped-types";
import { CreateGalleryReportDto } from "./create-gallery_report.dto";
import { IsEnum } from "@nestjs/class-validator";

export class UpdateGalleryReportDto extends PartialType(CreateGalleryReportDto) {
    @IsEnum(["open", "close", "deleted"])
    status: string;
}
