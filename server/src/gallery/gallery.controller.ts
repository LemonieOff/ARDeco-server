import {
    Body,
    Controller, Delete,
    Get,
    Param, Post,
    Put,
    Req,
    Res,
} from '@nestjs/common';
import {GalleryService} from './gallery.service';
import {Request, Response} from 'express';
import {JwtService} from '@nestjs/jwt';
import {Gallery} from './models/gallery.entity';
import {QueryPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {User} from "../user/models/user.entity";
import {UserService} from "../user/user.service";

@Controller(['gallery', 'galery'])
export class GalleryController {
    constructor(
        private galleryService: GalleryService,
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Get()
    all() {
        return ['gallery'];
    }

    @Get(":id")
    async get(@Req() req: Request, @Param("id") id: number, @Res({passthrough: true}) res: Response) {
        const item = await this.galleryService.findOne({id: id});

        const authorizedUser = await this.checkAuthorization(req, res, item, "view");
        if (!(authorizedUser instanceof User)) return authorizedUser;

        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Gallery item",
            "data": item
        };
    }

    @Post()
    async post(@Req() req: Request, @Body() item: QueryPartialEntity<Gallery>, @Res({passthrough: true}) res: Response) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                "status": "KO",
                "code": 401,
                "description": "You have to login in order to create a gallery item",
                "data": null
            };
        }

        const user = await this.userService.findOne({id: data["id"]});

        if (!user) {
            res.status(403);
            return {
                "status": "KO",
                "code": 403,
                "description": "You are not allowed to create a gallery item",
                "data": null
            };
        }

        try {
            item.user_id = user.id;
            const result = await this.galleryService.create(item);
            res.status(201);
            return {
                status: 'OK',
                code: 201,
                description: 'Gallery item was created',
                data: result,
            };
        } catch (e) {
            res.status(400);
            return {
                status: 'KO',
                code: 400,
                description: 'Gallery item was not created because of an error',
                error: e,
                data: null,
            };
        }
    }

    @Delete(':id')
    async deleteItem(@Req() req: Request, @Param("id") id: number, @Res({passthrough: true}) res: Response) {
        const item = await this.galleryService.findOne({id: id});

        const authorizedUser = await this.checkAuthorization(req, res, item, "delete");
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const result = await this.galleryService.delete(id);
            res.status(200);
            return {
                "status": "OK",
                "code": 200,
                "description": "Gallery item has successfully been deleted",
                "data": result
            };
        } catch (e) {
            res.status(500);
            return {
                "status": "OK",
                "code": 500,
                "description": "Server error",
                "data": item
            };
        }
    }

    @Put(':id')
    async editViaParam(
        @Req() req: Request,
        @Param('id') id: number,
        @Body() item: QueryPartialEntity<Gallery>,
        @Res({passthrough: true}) res: Response,
    ) {
        console.log(item);
        return await this.editItem(req, id, item, res);
    }

    async editItem(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<Gallery>,
        res: Response,
    ) {
        try {
            const item = await this.galleryService.findOne({id: id});

            const authorizedUser = await this.checkAuthorization(req, res, item, "edit");
            if (!(authorizedUser instanceof User)) return authorizedUser;

            const result = await this.galleryService.update(id, new_item);
            res.status(200);
            return {
                status: 'OK',
                code: 200,
                description: 'Gallery item was updated',
                data: result,
            };
        } catch (e) {
            res.status(400);
            return {
                status: 'KO',
                code: 400,
                description: 'Gallery item was not updated because of an error',
                error: e,
                data: null,
            };
        }
    }

    async checkAuthorization(req: Request, res: Response, item: Gallery, action: string) {
        if (!item) {
            res.status(404);
            return {
                status: 'KO',
                code: 404,
                description: 'Resource was not found',
                data: null,
            };
        }

        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                "status": "KO",
                "code": 401,
                "description": "You are not connected",
                "data": null
            };
        }

        const user = await this.userService.findOne({id: data["id"]});

        if (!user) {
            res.status(403);
            return {
                "status": "KO",
                "code": 403,
                "description": "You are not allowed to access/modify this resource",
                "data": null
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
                            "status": "KO",
                            "code": 403,
                            "description": "You are not allowed to access this resource",
                            "data": null
                        };
                    }
                }
            }
        } else {
            // Check if user is the creator
            if (item.user_id !== user.id) {
                // If not, check if it's an admin
                if (user.role !== "admin") {
                    res.status(403);
                    return {
                        "status": "KO",
                        "code": 403,
                        "description": "You are not allowed to modify/delete this resource",
                        "data": null
                    };
                }
            }
        }

        return user;
    }

}
