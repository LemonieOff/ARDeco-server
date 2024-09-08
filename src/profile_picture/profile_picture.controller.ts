import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";

@Controller("profile_picture")
export class ProfilePictureController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
    }

    @Get("user")
    async getCurrentUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "get");

        if (user instanceof User) {
            const id = user.profile_picture_id;
            return {
                status: "OK",
                code: 200,
                description: "Profile picture id",
                data: {
                    id: id,
                    url: `https://api.ardeco.app/profile_pictures/${id}.png`
                }
            };
        }

        return user;
    }

    @Get("user/:id")
    async getUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("id", ParseIntPipe) id: number
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "get", id);

        if (user instanceof User) {
            const specifiedUser = await this.userService.findOne({ id: id });
            const profile_id = specifiedUser.profile_picture_id;
            return {
                status: "OK",
                code: 200,
                description: "Profile picture id",
                data: {
                    id: profile_id,
                    url: `https://api.ardeco.app/profile_pictures/${profile_id}.png`
                }
            };
        }

        return user;
    }

    @Put("user")
    async setCurrentUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body("picture_id") picture_id: number
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "set");

        if (user instanceof User) {
            if (picture_id < 0 || picture_id > 4) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "Invalid picture id",
                    data: null
                };
            }

            await this.userService.update(user.id, { profile_picture_id: picture_id });
            return {
                status: "OK",
                code: 200,
                description: "Profile picture id updated",
                data: {
                    id: picture_id,
                    url: `https://api.ardeco.app/profile_pictures/${picture_id}.png`
                }
            };
        }

        return user;
    }

    @Put("user/:id")
    async setUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("id", ParseIntPipe) id: number,
        @Body("picture_id") picture_id: number
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "set", id, picture_id);

        if (user instanceof User) {
            if (picture_id < 0 || picture_id > 4) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "Invalid picture id",
                    data: null
                };
            }

            await this.userService.update(id, { profile_picture_id: picture_id });
            return {
                status: "OK",
                code: 200,
                description: "Profile picture id updated",
                data: {
                    id: picture_id,
                    url: `https://api.ardeco.app/profile_pictures/${picture_id}.png`
                }
            };
        }

        return user;
    }

    @Delete("user")
    async deleteCurrentUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "delete");

        if (user instanceof User) {
            await this.userService.update(user.id, { profile_picture_id: 0 });
            return {
                status: "OK",
                code: 200,
                description: "Profile picture reinitialized",
                data: {
                    id: 0,
                    url: `https://api.ardeco.app/profile_pictures/0.png`
                }
            };
        }

        return user;
    }

    @Delete("user/:id")
    async deleteUserProfilePicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("id", ParseIntPipe) id: number
    ) {
        const user = await this.checkAuthorizationForUser(req, res, "delete", id);

        if (user instanceof User) {
            await this.userService.update(id, { profile_picture_id: 0 });
            return {
                status: "OK",
                code: 200,
                description: "Profile picture reinitialized",
                data: {
                    id: 0,
                    url: `https://api.ardeco.app/profile_pictures/0.png`
                }
            };
        }

        return user;
    }

    @Get("picture")
    async getAllPicturesIds(
        @Res({ passthrough: true }) res: Response
    ) {
        res.status(200).json({
            "status": "OK",
            "code": 200,
            "description": "All available picture ids",
            "data": [
                {
                    id: 0,
                    url: `https://api.ardeco.app/profile_pictures/0.png`
                },
                {
                    id: 1,
                    url: `https://api.ardeco.app/profile_pictures/1.png`
                },
                {
                    id: 2,
                    url: `https://api.ardeco.app/profile_pictures/2.png`
                },
                {
                    id: 3,
                    url: `https://api.ardeco.app/profile_pictures/3.png`
                },
                {
                    id: 4,
                    url: `https://api.ardeco.app/profile_pictures/4.png`
                }
            ]
        });
    }

    @Get("picture/:id")
    async getPicture(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("id", ParseIntPipe) id: number
    ) {
        if (id < 0 || id > 4) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Profile picture not found",
                data: null
            };
        }

        return {
            status: "OK",
            code: 200,
            description: "Profile picture",
            data: `https://api.ardeco.app/profile_pictures/${id}.png`
        };
    }

    private async checkAuthorizationForUser(req: Request, res: Response, type: string, specifiedUser: number | null = null, picture_id: number = null): Promise<User | {
        status: string;
        code: number;
        description: string;
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
                description:
                    "You have to login in order to access profile picture's tools",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to access profile picture's tools",
                data: null
            };
        }

        if (specifiedUser) {
            const resUser = await this.userService.findOne({ id: specifiedUser });
            if (!resUser) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "User not found",
                    data: null
                };
            }

            if (type !== "get") {
                if (user.role !== "admin" && user.id !== specifiedUser) {
                    res.status(403);
                    return {
                        status: "KO",
                        code: 403,
                        description: "You are not allowed to access profile picture's tools for another user",
                        data: null
                    };
                }
            }
        }

        return user;
    }
}
