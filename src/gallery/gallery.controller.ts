import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { GalleryService } from "./gallery.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Gallery } from "./models/gallery.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";

@Controller(["gallery", "galery"])
export class GalleryController {
    constructor(
        private galleryService: GalleryService,
        private jwtService: JwtService,
        private userService: UserService,
        private blockedUsersService: BlockedUsersService
    ) {
    }

    // Get all gallery items
    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const fetcher = await this.checkLogin(req, res);
        if (!(fetcher instanceof User)) return fetcher;

        // Get all query parameters
        const user_id_query = req.query["user_id"];
        const limit_query = req.query["limit"];
        const begin_pos_query = req.query["begin_pos"];

        let user_id: number = Number(user_id_query);
        let limit: number | null = Number(limit_query);
        let begin_pos: number | null = Number(begin_pos_query);

        // If the user_id param query is set, check if it's a number and if the user exists
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

        // If the limit param query is set, check if it's a number
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

        // If the begin_pos param query is set, check if it's a number
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

            // Limit is mandatory if begin_pos is set
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

        // Default relations and selected relations' items
        const [select, relations] = this.getSelect(req);

        const items = await this.galleryService.findAll(
            fetcher.id,
            user_id,
            limit,
            begin_pos,
            relations,
            select
        );

        // Response object final customization
        items.forEach((item) => {
            // Remove the last name if needed (inexistant setting(s) or explicitly defined)
            if (!item.user.settings || !item.user.settings.display_lastname_on_public) {
                if (item.user.last_name) item.user.last_name = "";
            }
            delete item.user.settings;
        });

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
        const user = await this.checkLogin(req, res);
        if (!(user instanceof User)) return user;

        const [select, relations] = this.getSelect(req);

        const item = await this.galleryService.findOneById(id, relations, select);

        const authError = await this.checkViewGalleryAccess(user, item, res);
        if (authError) return authError;

        // Response object final customization

        // Remove the last name if needed (inexistant setting(s) or explicitly defined)
        if (!item.user.settings || !item.user.settings.display_lastname_on_public) {
            if (item.user.last_name) item.user.last_name = "";
        }
        delete item.user.settings;

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

        const user = await this.checkLogin(req, res);
        if (!(user instanceof User)) return user;

        const authError = await this.checkViewUserAccess(user, user_id, res);
        if (authError) return authError;

        // If the user is not the creator nor an admin, can't see private items
        // Visibility false means all items, and true means only public items
        const visibility = !(user.id === user_id || user.role === "admin");

        const items = await this.galleryService.findForUser(user_id, visibility);

        // Response object final customization
        items.forEach((item) => {
            // Remove the last name if needed (inexistant setting(s) or explicitly defined)
            if (!item.user.settings || !item.user.settings.display_lastname_on_public) {
                if (item.user.last_name) item.user.last_name = "";
            }
            delete item.user.settings;
        });

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: `User ${user_id} gallery`,
            data: items
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<Gallery>,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkLogin(req, res);
        if (!(user instanceof User)) return user;

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
        const user = await this.checkLogin(req, res);
        if (!(user instanceof User)) return user;

        const item = await this.galleryService.findOne({ id: id });

        const authError = this.checkPermissions(
            user,
            res,
            item,
            "delete"
        );
        if (authError) return authError;

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
            const user = await this.checkLogin(req, res);
            if (!(user instanceof User)) return user;

            const item = await this.galleryService.findOne({ id: id });

            const authError = this.checkPermissions(
                user,
                res,
                item,
                "modify"
            );
            if (authError) return authError;

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

    async checkLogin(
        req: Request,
        res: Response
    ): Promise<{
        code: number;
        data: null;
        description: string;
        status: string
    } | User> {
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
                    "You are not allowed to access/modify this gallery",
                data: null
            };
        }

        return user;
    }

    async checkViewGalleryAccess(
        user: User,
        item: Gallery,
        res: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null
    }> {
        if (!item) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Gallery was not found",
                data: null
            };
        }

        // Creator has all rights on its own galleries, private or not
        if (user.id === item.user.id) return null;

        // Admin can access everything (invisible items and blocked ones)
        if (user.role === "admin") return null;

        // Check for item visibility, private ones are inaccessible
        if (!item.visibility) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to access this gallery",
                data: null
            };
        }

        // Check if the request user is blocking the item creator user
        const isFetcherBlockingCreator = await this.blockedUsersService.checkBlockedForBlocker(user.id, item.user.id);
        if (isFetcherBlockingCreator) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You cannot access this gallery because you have blocked its creator.",
                data: null
            };
        }

        // Check if the request user is blocked by the item creator user
        const isFetcherBlockedByCreator = await this.blockedUsersService.checkBlockedForBlocker(item.user.id, user.id);
        if (isFetcherBlockedByCreator) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                // Same description as private items,
                // to not reveal the fact of being blocked
                description: "You are not allowed to access this gallery",
                data: null
            };
        }

        return null;
    }

    async checkViewUserAccess(
        fetcher: User,
        user_id: number,
        res: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null
    }> {
        // Check if fetcher is user to fetch to avoid useless requests and computation
        if (fetcher.id === user_id) return null;

        const user = await this.userService.findOne({ id: user_id }, { id: true });
        if (!user) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Gallery creator user was not found",
                data: null
            };
        }

        // Admin can access everything (invisible items and blocked ones)
        if (fetcher.role === "admin") return null;

        // Check if the request user is blocking the item creator user
        const isFetcherBlockingCreator = await this.blockedUsersService.checkBlockedForBlocker(fetcher.id, user.id);
        if (isFetcherBlockingCreator) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You cannot access this user's public galleries because you have blocked them.",
                data: null
            };
        }

        // Check if the request user is blocked by the item creator user
        const isFetcherBlockedByCreator = await this.blockedUsersService.checkBlockedForBlocker(user.id, fetcher.id);
        if (isFetcherBlockedByCreator) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to access this user's public galleries",
                data: null
            };
        }

        return null;
    }


    checkPermissions(
        user: User,
        res: Response,
        item: Gallery,
        action: "modify" | "delete"
    ): {
        code: number;
        data: null;
        description: string;
        status: string
    } {
        if (!item) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Gallery was not found",
                data: null
            };
        }

        // Check if the user is the creator
        if (item.user_id !== user.id) {
            // If not, check if it's an admin
            if (user.role !== "admin") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        `You are not allowed to ${action} this gallery`,
                    data: null
                };
            }
        }

        return null;
    }

    getSelect(req: Request): [FindOptionsSelect<Gallery>, FindOptionsRelations<Gallery>] {
        const relations: FindOptionsRelations<Gallery> = {
            comments: true,
            user: true
        };
        const select: FindOptionsSelect<Gallery> = {
            id: true,
            visibility: true,
            description: true,
            furniture: true,
            name: true,
            room_type: true,
            comments: {
                id: true
            },
            user: {
                id: true
            }
        };

        // Include more information about the user if required
        const user_details = req.query["user_details"];
        if (user_details !== undefined) {
            relations.user = {
                settings: true
            };
            select.user = {
                id: true,
                role: true,
                first_name: true,
                last_name: true,
                profile_picture_id: true,
                settings: {
                    display_lastname_on_public: true
                }
            };
        }

        // Include more information about the comments if required
        const comments_details = req.query["comments_details"];
        if (comments_details !== undefined) {
            select.comments = true;
        }

        return [select, relations];
    }
}
