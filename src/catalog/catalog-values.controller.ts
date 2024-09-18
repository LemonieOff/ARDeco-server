import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as FurnitureValues from "./values";

@Controller("catalog/values")
export class CatalogValuesController {
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Get()
    async allValues(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Furniture available values",
            data: {
                colors: FurnitureValues.colors,
                rooms: FurnitureValues.rooms,
                styles: FurnitureValues.styles
            }
        };
    }

    @Get("colors")
    async getColors(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Furniture available colors",
            "data": FurnitureValues.colors
        };
    }

    @Get("styles")
    async getStyles(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Furniture available styles",
            "data": FurnitureValues.styles
        };
    }

    @Get("rooms")
    async getRooms(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Furniture available rooms",
            "data": FurnitureValues.rooms
        };
    }

    async checkAuthorization(
        req: Request,
        res: Response
    ): Promise<Promise<User> | {
        status: string,
        code: number,
        description: string,
        data: null
    }> {
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
