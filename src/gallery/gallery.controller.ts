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
import { GalleryService } from "./gallery.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Gallery } from "./models/gallery.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { FindOptionsRelations } from "typeorm";

@Controller(["gallery", "galery"])
export class GalleryController {
    constructor(
        private galleryService: GalleryService,
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    // Get all gallery items
    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

        // Get all query parameters
        const user_id_query = req.query["user_id"];
        const limit_query = req.query["limit"];
        const begin_pos_query = req.query["begin_pos"];

        let user_id: number = Number(user_id_query);
        let limit: number | null = Number(limit_query);
        let begin_pos: number | null = Number(begin_pos_query);

        // If user_id query is set, check if it's a number and if the user exists
        if (user_id_query) {
            if (isNaN(user_id)) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "User id must be a number",
                    data: null
                };
            }

            const user = await this.userService.findOne({ id: user_id });

            if (!user) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "User was not found",
                    data: null
                };
            }
        } else {
            user_id = null;
        }

        // If limit query is set, check if it's a number
        if (limit_query) {
            if (isNaN(limit)) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "Limit must be a number",
                    data: null
                };
            }
        } else {
            limit = null;
        }

        // If begin_pos query is set, check if it's a number
        if (begin_pos_query) {
            if (isNaN(begin_pos)) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "Begin position must be a number",
                    data: null
                };
            }

            // limit is mandatory if begin_pos is set
            if (!limit) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "Limit is mandatory if begin position is set",
                    data: null
                };
            }
        } else {
            begin_pos = null;
        }

        const user_details = req.query["user_details"];
        const options: [FindOptionsRelations<Gallery>, string[]] = [{}, ["user"]];
        if (user_details !== undefined) {
            options[0] = {
                user: true
            };
            options[1] = [];
        }

        const items = await this.galleryService.findAll(
            user_id,
            limit,
            begin_pos,
            options
        );

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Gallery items",
            data: items
        };
    }

    // Get a specific gallery item from its unique id
    @Get(":id")
    async get(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const user_details = req.query["user_details"];
        const options: [FindOptionsRelations<Gallery>, string[]] = [{}, ["user"]];
        if (user_details !== undefined) {
            options[0] = {
                user: true
            };
            options[1] = [];
        }

        const item = await this.galleryService.findOne({ id: id }, options);

        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            item,
            "view"
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Gallery item",
            data: item
        };
    }

    // Get all gallery items from a specific user
    @Get("user/:user_id")
    async getFromUser(
        @Req() req: Request,
        @Param("user_id") user_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        user_id = Number(user_id);
        if (isNaN(user_id)) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User id is not a number",
                data: null
            };
        }

        const user = await this.checkAuthorization(req, res, null, "user_gallery", user_id);
        if (!(user instanceof User)) return user;

        // If user is not the creator nor an admin, can't see private items
        // Visibility false means all items, and true means only public items
        const visibility = !(user.id === user_id || user.role === "admin");

        const items = await this.galleryService.findForUser(user_id, visibility);

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Gallery items",
            data: items
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<Gallery>,
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
                    "You have to login in order to create a gallery item",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to create a gallery item",
                data: null
            };
        }

        try {
            item.user = user;
            const result = await this.galleryService.create(item);
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "Gallery item was created",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Gallery item was not created because of an error",
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
        const item = await this.galleryService.findOne({ id: id });

        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            item,
            "delete"
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const result = await this.galleryService.delete(id);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Gallery item has successfully been deleted",
                data: result
            };
        } catch (e) {
            res.status(500);
            return {
                status: "KO",
                code: 500,
                description: "Server error",
                data: item
            };
        }
    }

    @Put(":id")
    async editViaParam(
        @Req() req: Request,
        @Param("id") id: number,
        @Body() item: QueryPartialEntity<Gallery>,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.editItem(req, id, item, res);
    }

    async editItem(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<Gallery>,
        res: Response
    ) {
        try {
            const item = await this.galleryService.findOne({ id: id });

            const authorizedUser = await this.checkAuthorization(
                req,
                res,
                item,
                "edit"
            );
            if (!(authorizedUser instanceof User)) return authorizedUser;

            const result = await this.galleryService.update(id, new_item);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Gallery item was updated",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Gallery item was not updated because of an error",
                error: e,
                data: null
            };
        }
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        item: Gallery,
        action: string,
        user_id: number | null = null
    ): Promise<{
        code: number;
        data: null;
        description: string;
        status: string
    } | User> {
        // Check if item exists only for "view", "edit" and "delete" actions
        if (action === "view" || action === "edit" || action === "delete") {
            if (!item) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "Resource was not found",
                    data: null
                };
            }
        }

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

        // Check if item is not visible for everyone
        if (action === "view") {
            if (!item.visibility) {
                // Check if user is the creator
                if (item.user_id !== user.id) {
                    // If not, check if it's an admin
                    if (user.role !== "admin") {
                        res.status(403);
                        return {
                            status: "KO",
                            code: 403,
                            description:
                                "You are not allowed to access this resource",
                            data: null
                        };
                    }
                }
            }
        } else if (action === "edit" || action === "delete") {
            // Check if user is the creator
            if (item.user_id !== user.id) {
                // If not, check if it's an admin
                if (user.role !== "admin") {
                    res.status(403);
                    return {
                        status: "KO",
                        code: 403,
                        description:
                            "You are not allowed to modify/delete this resource",
                        data: null
                    };
                }
            }
        } else if (action === "user_gallery") {
            if (user_id === null) {
                console.error("User gallery fetch check auth : gallery_id is null");
                res.status(501);
                return {
                    status: "KO",
                    code: 501,
                    description: "Server internal error",
                    data: null
                };
            }
        }

        return user;
    }
}
