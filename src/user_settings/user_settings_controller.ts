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
import { UserSettingsService } from "./user_settings_service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UserSettings } from "./models/user_settings.entity";
import { User } from "../user/models/user.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { UserService } from "../user/user.service";

@Controller("settings")
export class UserSettingsController {
    constructor(
        private userSettingsService: UserSettingsService,
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    @Get(":id")
    async get(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const item = await this.userSettingsService.findOne({ id: id });

        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            true,
            item
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "User settings",
            data: item
        };
    }

    @Get()
    async getOwnSettings(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, false, null);
        if (!(user instanceof User)) return user;

        const existingSettings = await this.userSettingsService.findOne({
            user_id: user.id
        });
        if (existingSettings) {
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Your user settings",
                data: existingSettings
            };
        } else {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "You don't have any user settings yet",
                data: null
            };
        }
    }

    @Post()
    async post(
        @Req() req: Request,
        @Body() settings: QueryPartialEntity<UserSettings>,
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
                    "You have to login in order to create user settings",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to create user settings",
                data: null
            };
        }

        // Check if user settings already exist, if so, return an error and don't create a new one
        const existingSettings = await this.userSettingsService.findOne({
            user_id: user.id
        });
        if (existingSettings) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User settings already exist",
                data: null
            };
        }

        try {
            settings.user_id = user.id;
            const result = await this.userSettingsService.create(settings);
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "User settings was created",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description:
                    "User settings was not created because of an error",
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
        const item = await this.userSettingsService.findOne({ id: id });

        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            true,
            item
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const result = await this.userSettingsService.delete(id);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Settings has successfully been deleted",
                data: result
            };
        } catch (e) {
            res.status(500);
            return {
                status: "OK",
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
        @Body() item: QueryPartialEntity<UserSettings>,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.editItem(req, id, item, res);
    }

    // Edit current user's settings
    @Put()
    async editOwnSettings(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<UserSettings>,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, false, null);
        if (!(user instanceof User)) return user;

        const existingSettings = await this.userSettingsService.findOne(
            { user_id: user.id },
            { id: true }
        );

        if (!existingSettings) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "You don't have any user settings yet",
                data: null
            };
        }

        return await this.editItem(req, existingSettings.id, item, res);
    }

    // Edit current user's settings
    @Put("/user/:user_id")
    async editSpecificUserSettings(
      @Req() req: Request,
      @Param("user_id") user_id: number,
      @Body() item: QueryPartialEntity<UserSettings>,
      @Res({ passthrough: true }) res: Response
    ) {
        try {
            user_id = Number(user_id);
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User id is not a number",
                data: null
            };
        }

        const existingSettings = await this.userSettingsService.findOne(
          { user_id: user_id },
          { id: true }
        );

        console.log(existingSettings);

        if (!existingSettings) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "There are no settings for this user yet",
                data: null
            };
        }

        return await this.editItem(req, existingSettings.id, item, res);
    }

    async editItem(
        req: Request,
        id: number,
        new_item: QueryPartialEntity<UserSettings>,
        res: Response
    ) {
        try {
            const item = await this.userSettingsService.findOne({ id: id }, { id: true, user_id: true });

            const authorizedUser = await this.checkAuthorization(
                req,
                res,
                true,
                item
            );
            if (!(authorizedUser instanceof User)) return authorizedUser;

            const result = await this.userSettingsService.update(id, new_item);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "User settings was updated",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description:
                    "User settings was not updated because of an error",
                error: e,
                data: null
            };
        }
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        check_settings: boolean,
        settings: UserSettings | null
    ) {
        if (check_settings) {
            if (!settings) {
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

        if (check_settings) {
            // Forbidden access if user is neither the creator nor an admin
            if (settings.user_id !== user.id && user.role !== "admin") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "You are not allowed to access/modify/delete this resource",
                    data: null
                };
            }
        }
        return user;
    }
}
