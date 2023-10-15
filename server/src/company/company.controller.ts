import { Body, Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { createHash, randomBytes } from "crypto";

@Controller("company")
export class CompanyController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async generateToken(
        company: User,
        iteration: number = 0,
        max_iteration: number = 10
    ) {
        if (iteration >= max_iteration) {
            throw new Error("Max iteration reached");
        }

        const textToEncrypt = `${company.id}.${company.first_name}.${
            company.last_name
        }.${Date.now()}.${randomBytes(32).toString("hex")}`;
        const encryptedText = createHash("sha256")
            .update(textToEncrypt)
            .digest("hex");
        await this.userService
            .findOne({ company_api_key: encryptedText })
            .then(res => {
                if (res !== null) {
                    console.error("Already exist");
                    return this.generateToken(company, iteration + 1);
                }
            });
        return encryptedText;
    }

    @Get("requestToken")
    async requestToken(
        @Req() req: Request,
        @Body() user: User,
        @Res({ passthrough: true }) res: Response
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

            const company = await this.userService.findOne({ id: data["id"] });
            if (company["role"] != "company") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "You are not allowed to access this resource, you are not a company",
                    data: null
                };
            }

            const encryptedText = await this.generateToken(company);
            company["company_api_key"] = encryptedText;
            await this.userService.update(company["id"], company);

            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "API key generated",
                data: encryptedText,
                token: encryptedText
            };
        } catch (e) {
            console.error(e);
            res.status(500);
            return {
                status: "KO",
                code: 500,
                description: "Internal error",
                error: e,
                data: null
            };
        }
    }
}
