import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    Res
} from "@nestjs/common";
import { Request, Response } from "express";
import { FavoriteGallery } from "./models/favorite_gallery.entity";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";

@Controller("favorite/gallery")
export class FavoriteGalleryController {
    constructor(
        private favGalleryService: FavoriteGalleryService,
        private jwtService: JwtService,
        private userService: UserService,
        private galleryService: GalleryService
    ) {}

    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        /*// Get all query parameters
        const limit_query = req.query["limit"];
        const begin_pos_query = req.query["begin_pos"];
        //const furniture_id_query = req.query["furniture_id"];

        let limit: number | null = Number(limit_query);
        let begin_pos: number | null = Number(begin_pos_query);
        // let furniture_id: string | null = String(furniture_id_query);*/

        const items = await this.favGalleryService.findAll(
            user.id,
        );

        try {
            if (items.length === 0) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "You don't have any favorite gallery items",
                    data: []
                };
            }

            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Favorite Gallery items",
                data: items
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Favorite Gallery list was not display because of an error",
                error: e,
                data: null
            };
        }
    }

    @Post("/:gallery_id")
    async post(
        @Req() req: Request,
        @Param("gallery_id") gallery_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        try {
            gallery_id = Number(gallery_id);
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Gallery id is not a number",
                data: null
            };
        }

        const gallery = await this.galleryService.findOne({ id: gallery_id });
        if (!gallery) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description:
                    "You are not allowed to add this gallery to your favorites because it does not exist",
                data: null
            };
        }

        const existingItem = await this.favGalleryService.findOne({
            gallery_id: gallery_id,
            user_id: user.id
        });
        if (existingItem) {
            res.status(409);
            return {
                status: "KO",
                code: 409,
                description: "You already have this gallery in your favorites",
                data: null
            };
        }

        try {
            const favoriteGallery = new FavoriteGallery();
            favoriteGallery.gallery_id = gallery_id;
            favoriteGallery.user_id = user.id;
            const result = await this.favGalleryService.create(favoriteGallery);
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "Gallery item was added to your favorites",
                data: result
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Gallery item was not added to your favorites because of an error",
                error: e,
                data: null
            };
        }
    }

    @Delete("/:gallery_id")
    async deleteItem(
        @Req() req: Request,
        @Param("gallery_id") gallery_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const gallery = await this.galleryService.findOne({ id: gallery_id });

        const authorizedUser = await this.checkAuthorization(
            req,
            res
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const result = await this.favgalleryService.delete(gallery_id);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description:
                    "Favorite gallery item has successfully been deleted",
                data: result
            };
        } catch (e) {
            res.status(501);
            return {
                status: "OK",
                code: 501,
                description: "Server error",
                data: gallery_id
            };
        }
    }

    async checkAuthorization(
        req: Request,
        res: Response,
    ) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description:
                    "You are not allowed to access/modify this resource",
                data: null
            };
        }
        return user;
    }
}
