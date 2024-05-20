import { Controller, Param, Put, Req, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { UserService } from "src/user/user.service";

@Controller("create-company")
export class CreateCompanyController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
    }

    @Put("/:id")
    async toCompany(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.editUserToCompany(req, id, res);
    }

    private async editUserToCompany(
        req: Request,
        id: number,
        res: Response
    ) {
        try {
            const cookie = req.cookies["jwt"];
            const data = cookie ? this.jwtService.verify(cookie) : null;
            if (!cookie || !data) {
                res.status(401);
                return {
                    status: "KO",
                    code: 401,
                    description: "You are not connected",
                    data: null
                };
            }
            const request_user = await this.userService.findOne({ id: data["id"] });

            if (!request_user || request_user.role !== "admin") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to promote this user to a company",
                    data: null
                };
            }

            const user = await this.userService.findOne({ id: id });

            if (!user) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: `The specified user (${id}) was not found`,
                    data: null
                };
            }

            if (user["role"] !== "client") {
                res.status(400);
                return {
                    status: "KO",
                    code: 400,
                    description: "This user is not a client and then cannot be changed to a company",
                    data: null
                };
            }

            const result = await this.userService.update(user.id, { role: "company" });
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
                code: 501,
                description: "User was not updated because of an error",
                error: e,
                data: null
            };
        }
    }
}
