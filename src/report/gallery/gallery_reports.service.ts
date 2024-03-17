import { Injectable } from "@nestjs/common";
import { CreateGalleryReportDto } from "./dto/create-gallery_report.dto";
import { UpdateGalleryReportDto } from "./dto/update-gallery_report.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { GalleryReport } from "./models/gallery_reports.entity";
import { User } from "../../user/models/user.entity";
import { Gallery } from "../../gallery/models/gallery.entity";

@Injectable()
export class GalleryReportsService {
    constructor(
        @InjectRepository(GalleryReport)
        private readonly galleryReportRepository: Repository<GalleryReport>
    ) {
    }

    async create(user: User, gallery: Gallery, report_text: string) {
        const report = new GalleryReport();
        report.user = user;
        report.gallery = gallery;
        report.report_text = report_text;
        report.status = "open";
        return this.galleryReportRepository.save(report);
    }

    findAllByUser(user_id: number) {
        return this.galleryReportRepository.find({
            where: {
                user: { id: user_id }
            }
        });
    }

    findAllByGallery(gallery_id: number, where: FindOptionsWhere<GalleryReport> = {}) {
        const finalWhere = {
            gallery: {
                id: gallery_id
            },
            ...where
        };

        return this.galleryReportRepository.find({ where: finalWhere, loadRelationIds: true });
    }

    findOpenByUserAndGallery(user_id: number, gallery_id: number) {
        return this.galleryReportRepository.findOne({
            where: {
                user: { id: user_id },
                gallery: { id: gallery_id },
                status: "open"
            }
        });
    }

    findOne(id: number) {
        return this.galleryReportRepository.findOne({
            where: {
                id: id
            }
        });
    }

    edit(id: number, updateBlockedUserDto: UpdateGalleryReportDto) {
        return this.galleryReportRepository.update(id, updateBlockedUserDto);
    }

    /*close() {
        return this.galleryReportRepository.delete({
            user_id: user_id,
            blocked_user_id: blocked_user_id
        });
    }*/
}
