import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { AuthGuard } from "../auth/auth.guard";
import { JwtService } from "@nestjs/jwt";
import { User } from "./models/user.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Controller("user")
export class UserController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
    }

    @Get()
    all() {
        return ["users"];
    }

    @Get("usertypes")
    async getUserTypes(@Req() req: Request) {

        try {
            const cookie = req.cookies["jwt"];
            const data = this.jwtService.verify(cookie);
            const usr = await this.userService.findOne({id: data['id']})

            if (usr["role"] != "admin") {
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to use this endpoint",
                    data: null
                };
            }

            const users = await this.userService.all();

            let admin = 0;
            let company = 0;
            let user = 0;
            let deleted = 0;

            for (let i = 0; i < users.length; i++) {
                if (users[i].deleted == true) {
                    deleted++;
                }
                if (users[i].role == "admin") {
                    admin++;
                } else if (users[i].role == "company") {
                    company++;
                } else {
                    user++;
                }
            }

            return {
                status: "OK",
                code: 200,
                description: "User types have been found",
                data: {
                    admin,
                    company,
                    user,
                    deleted,
                    totalActive: admin + company + user - deleted,
                    totalWithDeleted: admin + company + user
                }
            };
        } catch (e) {
            console.error("Error in getUserTypes:", e);
            return {
                status: "KO",
                code: 400,
                description: "Error while fetching user types",
                error: e,
                data: null
            };
        }
    }

    @Get("basicusers")
    async getBasicUsers(@Req() req: Request) {
        try {
            const cookie = req.cookies["jwt"];
            const data = this.jwtService.verify(cookie);
            const usr = await this.userService.findOne({id: data['id']})

            if (usr["role"] != "admin") {
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to use this endpoint",
                    data: null
                };
            }
            const users = await this.userService.all();
            let basicUsers = [];
            for (let i = 0; i < users.length; i++) {
                if (users[i].role === "client") {
                    basicUsers.push(users[i]);
                }
            }
            return {
                status: "OK",
                code: 200,
                description: "Basic users have been found",
                data: basicUsers
            };
        } catch (e) {
            console.error("Error in getBasicUsers:", e);
            return {
                status: "KO",
                code: 400,
                description: "Error while fetching basic users",
                error: e,
                data: null
            };
        }
    }

    @Get("companies")
    async getCompanies(@Req() req: Request) {
        try {
            const cookie = req.cookies["jwt"];
            const data = this.jwtService.verify(cookie);
            const usr = await this.userService.findOne({id: data['id']})

            if (usr["role"] != "admin") {
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to use this endpoint",
                    data: null
                };
            }
            const users = await this.userService.all();
            let companies = [];
            for (let i = 0; i < users.length; i++) {
                if (users[i].role === "company") {
                    companies.push(users[i]);
                }
            }
            return {
                status: "OK",
                code: 200,
                description: "Companies have been found",
                data: companies
            };
        } catch (e) {
            console.error("Error in getCompanies:", e);
            return {
                status: "KO",
                code: 400,
                description: "Error while fetching companies",
                error: e,
                data: null
            };
        }
    }

    @Get(":id")
    async getOne(@Param("id") id: number) {
        const requestedUser = await this.userService.findOne({ id: id });
        console.log(requestedUser);
        if (requestedUser === undefined || requestedUser === null) {
            return {
                status: "KO",
                code: 404,
                description: "User was not found",
                error: "User was not found",
                data: null
            };
        }
        return {
            status: "OK",
            code: 200,
            description: "User has been found",
            data: {
                id: requestedUser.id,
                firstname: requestedUser.first_name,
                lastname: requestedUser.last_name,
                email: requestedUser.email,
                phone: requestedUser.phone,
                city: requestedUser.city,
                role: requestedUser.role
            }
        };
    }

    @UseGuards(AuthGuard)
    @Get("whoami")
    async whoami(@Req() request: Request) {
        const cookie = request.cookies["jwt"];
        const data = await this.jwtService.verifyAsync(cookie);
        return this.userService.findOne({ id: data["id"] });
    }

    @UseGuards(AuthGuard)
    @Put()
    async editViaQuery(
        @Req() req: Request,
        @Body() user: QueryPartialEntity<User>,
        @Res({ passthrough: true }) res: Response
    ) {
        const id = Number(req.query["id"]);
        if (id === undefined || isNaN(id)) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User was not updated because of an error",
                error: "User ID must be passed as a query parameter and be a number",
                data: null
            };
        }
        return await this.editUser(req, Number(req.query["id"]), user, res);
    }

    @UseGuards(AuthGuard)
    @Put(":id")
    async editViaParam(
        @Req() req: Request,
        @Param("id") id: number,
        @Body() user: QueryPartialEntity<User>,
        @Res({ passthrough: true }) res: Response
    ) {
        console.log(user);
        return await this.editUser(req, id, user, res);
    }

    async editUser(
        req: Request,
        id: number,
        user: QueryPartialEntity<User>,
        res: Response
    ) {
        try {
            const cookie = req.cookies["jwt"];
            const data = this.jwtService.verify(cookie);
            const request_user_id = await this.userService.findOne({
                id: data["id"]
            });
            if (data["id"] != id && request_user_id["role"] != "admin") {
                res.status(401);
                return {
                    status: "KO",
                    code: 401,
                    description: "You are not allowed to edit this user",
                    data: null
                };
            }

            // Change role only if requester is an admin
            if (
                user["role"] !== undefined &&
                request_user_id["role"] != "admin"
            ) {
                res.status(401);
                return {
                    status: "KO",
                    code: 401,
                    description:
                        "You are not allowed to modify the role of this user",
                    data: null
                };
            }

            // Check password in case of password change
            // TEMPORARY SOLUTION
            if (user["password"] !== undefined) {
                user["password"] = await bcrypt.hash(user["password"], 12);
            }

            const result = await this.userService.update(id, user);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "User was updated",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "User was not updated because of an error",
                error: e,
                data: null
            };
        }
    }
}
