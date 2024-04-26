import {
    Body,
    Controller,
    Param,
    Put,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from "express";
import { UserService } from 'src/user/user.service';


@Controller('create-company')
export class CreateCompanyController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    @Put("/:id")
    async toCompany(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.editUserToCompany(req, id, res);
    }

    async editUserToCompany(
        req: Request,
        id: number,
        res: Response
    ) {
        try {
            const cookie = req.cookies["jwt"];
            const data = this.jwtService.verify(cookie);
            if (!cookie || !data) {
                res.status(401);
                return {
                    status: "KO",
                    code: 401,
                    description: "You are not connected",
                    data: null
                };
            }
            const user = await this.userService.findOne({id: id});
            const request_user_id = await this.userService.findOne({
                id: data["id"]
            });

            if (!user) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description:
                        "The User you want to change does not exist",
                    data: null
                }; 
            }
            
            if (data["id"] && request_user_id["role"] != "admin") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to edit this user",
                    data: null
                };
            }
            if (
                user["role"] != "client"
            ) {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description:
                        "this user is not a client and then cannot be changed to a company",
                    data: null
                };
            }

            const result = await this.userService.update(user.id, {role: "company"})
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "User is now a company",
                data: result
            };
        } catch (e) {
            res.status(501);
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
