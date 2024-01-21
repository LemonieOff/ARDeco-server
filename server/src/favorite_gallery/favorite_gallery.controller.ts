import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res
} from "@nestjs/common";
import { Request, Response } from "express";
import { FavoriteGallery } from "./models/favorite_gallery.entity";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { JwtService } from "@nestjs/jwt";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { FindOptionsWhere } from "typeorm";
import { CatalogService } from "src/catalog/catalog.service";

@Controller("favorite/gallery")
export class FavoriteGalleryController {
    constructor(
        private favgalleryService: FavoriteGalleryService,
        private jwtService: JwtService,
        private userService: UserService,
        private catalogService: CatalogService
    ) {}

    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) {
            console.log("NO");
            return user;
        }

        // Get all query parameters
        const limit_query = req.query["limit"];
        const begin_pos_query = req.query["begin_pos"];
        //const furniture_id_query = req.query["furniture_id"];

        let limit: number | null = Number(limit_query);
        let begin_pos: number | null = Number(begin_pos_query);
        // let furniture_id: string | null = String(furniture_id_query);

        const items = await this.favgalleryService.findAll(
            user.id,
            limit,
            begin_pos
        );

        try {
            if (items.length === 0) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "You don't have any favorite gallery items",
                    data: null
                }
            }

            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Favorite Gallery items",
                data: items // si il m'y a pas d'item je dois faire un message avec un Code
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

    @Post() // remettre en param le fourniture_id une fois que ca marche
    async post(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<FavoriteGallery>,
        @Res({ passthrough: true }) res: Response
    ) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description:
                    "You have to login in order to create a Favorite gallery",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            // c'est pas le bon if il me faut "l’aménagement désigné n’est pas existant"
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description:
                    "You are not allowed to create a Favorite gallery because it does not exist",
                data: null
            };
        }

        if (!item) {
            res.status(409);
            return {
                status: "KO",
                code: 409,
                description:
                    "You are not allowed to create a Favorite gallery that is already existing",
                data: null
            };
        }

        try {
            item.user_id = user.id;
            const result = await this.favgalleryService.create(item);
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "Favorite Gallery item was created",
                data: result
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Favorite Gallery item was not created because of an error",
                error: e,
                data: null
            };
        }
    }

    @Delete(":id")
    async deleteItem(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const item = await this.favgalleryService.findOne({ id: id });

        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            item,
            "delete"
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const result = await this.favgalleryService.delete(id);
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
                data: item
            };
        }
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        favoriteGallery: FavoriteGallery | null = null,
        action: string | null = null
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
