import { Controller, Body, Req, Res, Param, Delete, Get, Post } from "@nestjs/common";
import { GalleryReportsService } from "./gallery_reports.service";
import { User } from "../../user/models/user.entity";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/user.service";
import { GalleryService } from "../../gallery/gallery.service";
import { PostGalleryReportDto } from "./dto/post-gallery_report.dto";
import { Gallery } from "../../gallery/models/gallery.entity";

@Controller()
export class GalleryReportsController {
    constructor(
        private readonly galleryReportsService: GalleryReportsService,
        private readonly galleryService: GalleryService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {
    }

    // Report an item
    @Post("/gallery_report/:gallery_id")
    async reportGallery(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("gallery_id") gallery_id: number,
        @Body() postGalleryReportDto: PostGalleryReportDto
    ) {
        const userAndGallery = await this.checkAuthorization(req, res, gallery_id, "post");
        if (!(userAndGallery instanceof Array)) return userAndGallery;

        const [user, gallery] = userAndGallery;

        const result = await this.galleryReportsService.create(user, gallery, postGalleryReportDto.report_text);
        if (!result) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description: "Gallery has not been reported because of an error",
                data: null
            };
        }

        res.status(201);
        return {
            status: "OK",
            code: 201,
            description: "Gallery has been reported successfully",
            data: result
        };
    }

    @Get("/gallery_report/:gallery_id/reports/number")
    async getReportsNumber(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("gallery_id") gallery_id: number
    ) {
        const userAndGallery = await this.checkAuthorization(req, res, gallery_id, "get");
        if (!(userAndGallery instanceof Array)) return userAndGallery;

        const [user, gallery] = userAndGallery;

        const reports = await this.galleryReportsService.findAllByGallery(gallery.id, { status: "open" });
        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Number of reports for this gallery",
            data: reports.length
        };
    }

    @Get("/gallery_report/:gallery_id/reports/list")
    async getReportsList(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("gallery_id") gallery_id: number
    ) {
        const userAndGallery = await this.checkAuthorization(req, res, gallery_id, "get");
        if (!(userAndGallery instanceof Array)) return userAndGallery;

        const [user, gallery] = userAndGallery;

        const reports = await this.galleryReportsService.findAllByGallery(gallery.id, { status: "open" });
        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "List of reports for this gallery",
            data: reports
        };
    }

    private async checkAuthorization(
        req: Request,
        res: Response,
        gallery_id: number,
        type: "get" | "post" | "close" | "delete"
    ): Promise<[User, Gallery] | {
        status: string;
        code: number;
        description: string;
        data: any;
    }> {
        gallery_id = Number(gallery_id);
        if (isNaN(gallery_id)) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            };
        }

        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description:
                    "You have to login in order to report a gallery",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            };
        }

        const gallery = await this.galleryService.findOne({ id: gallery_id });

        if (!gallery) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            };
        }

        if (type === "post") {
            const isUserAlreadyReported = await this.galleryReportsService.findOpenByUserAndGallery(user.id, gallery_id);

            if (isUserAlreadyReported) {
                res.status(409);
                return {
                    status: "KO",
                    code: 409,
                    description: "You have already reported this gallery",
                    data: null
                };
            }
        } else {
            if (user.role !== "admin") {
                return {
                    status: "KO",
                    code: 403,
                    description: "You must be an admin to access/close gallery reports",
                    data: null
                };
            }
        }

        return [user, gallery];
    }

}
