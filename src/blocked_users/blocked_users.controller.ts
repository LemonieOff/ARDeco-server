import { Controller, Body, Put, Req, Res, Param } from "@nestjs/common";
import { BlockedUsersService } from "./blocked_users.service";
import { CreateBlockedUserDto } from "./dto/create-blocked_user.dto";
import { User } from "../user/models/user.entity";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";

@Controller()
export class BlockedUsersController {
    constructor(
        private readonly blockedUsersService: BlockedUsersService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {
    }

    @Put("/block/:user_id")
    async blockUser(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("user_id") user_id: number
    ) {
        const user = await this.checkAuthorization(req, res, user_id);
        if (!(user instanceof User)) return user;

        const isUserAlreadyBlocked = await this.blockedUsersService.findOne(user.id, user_id);
        if (isUserAlreadyBlocked) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User is already blocked",
                data: null
            };
        }

        try {
            const blockedUser = new CreateBlockedUserDto();
            blockedUser.user_id = user.id;
            blockedUser.blocked_user_id = user_id;
            const result = await this.blockedUsersService.create(blockedUser);
            if (!result) {
                res.status(501);
                return {
                    status: "KO",
                    code: 501,
                    description: "User has not been blocked because of an error",
                    data: null
                };
            }
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "User has been blocked successfully",
                data: null
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "User has not been blocked because of an error",
                error: e,
                data: null
            };
        }

    }

    @Put("/unblock/:user_id")
    async unblockUser(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("user_id") user_id: number
    ) {
        const user = await this.checkAuthorization(req, res, user_id);
        if (!(user instanceof User)) return user;

        const isUserAlreadyBlocked = await this.blockedUsersService.findOne(user.id, user_id);
        if (!isUserAlreadyBlocked) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User is not blocked",
                data: null
            };
        }

        try {
            const result = await this.blockedUsersService.remove(user.id, user_id);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "User has been unblocked successfully",
                data: null
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "User has not been unblocked because of an error",
                error: e,
                data: null
            };
        }
    }

    private async checkAuthorization(
        req: Request,
        res: Response,
        user_id: number
    ) {
        user_id = Number(user_id);
        if (isNaN(user_id)) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "The id of the user to block/unblock must be a number",
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
                    "You have to login in order to block or unblock a user",
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

        if (user.id === user_id) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "You cannot block or unblock yourself",
                data: null
            };
        }

        const userToBlock = await this.userService.findOne({ id: user_id });

        if (!userToBlock) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User to block/unblock has not been found",
                data: null
            };
        }

        return user;
    }

}
