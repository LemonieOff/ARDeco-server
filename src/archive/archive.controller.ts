import { Controller, Delete, Get, Param, Put, Req, Res } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { ArchiveService } from "./archive.service";
import { Catalog } from "../catalog/models/catalog.entity";

@Controller("archive")
export class ArchiveController {
    constructor(
        private archiveService: ArchiveService,
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Get(":id")
    async get(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof Array)) return authorizedCompany;

        const objects = await this.archiveService.findAllForCompany(
            id
        );

        if (objects === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Objects not found",
                data: null
            };
        }
        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Objects list",
            data: objects
        };
    }

    @Delete(":company_id/:item_id")
    async remove(
        @Req() req: Request,
        @Param("company_id") company_id: number,
        @Param("item_id") item_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(
            req,
            res,
            company_id,
            item_id
        );
        if (!(authorizedCompany instanceof Array)) return authorizedCompany;

        const removedObject = await this.archiveService.deleteObjectForCompany(company_id, item_id);

        if (removedObject === null) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Object not removed",
                data: null
            };
        }

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Object removed",
            data: removedObject
        };
    }

    @Delete(":id")
    async removeAll(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof Array)) return authorizedCompany;

        const [company, _] = authorizedCompany;

        const removedObjects =
            await this.archiveService.deleteAllForCompany(
                company.id
            );
        if (removedObjects === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Objects not removed",
                data: null
            };
        }

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Objects removed",
            data: removedObjects
        };
    }

    @Put("restore/:id/:item_id")
    async restore(
        @Req() req: Request,
        @Param("id") company_id: number,
        @Param("item_id") item_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(
            req,
            res,
            company_id,
            item_id
        );
        if (!(authorizedCompany instanceof Array)) return authorizedCompany;

        const [_, object] = authorizedCompany;

        const restored_object = await this.archiveService.restore(object);
        console.log(restored_object);

        if (restored_object === null) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Object not restored",
                data: null
            };
        }

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Object restored",
            data: restored_object
        };
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        id: number,
        item_id: number = null
    ): Promise<[User, Catalog] | {
        status: string,
        code: number,
        description: string,
        data: null
    }> {
        let object: Catalog = null;

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

        // Check if request user exists
        const company = await this.userService.findOne({ id: data["id"] });
        if (!company) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "Your user doesn't exists ant can't access this resource",
                data: null
            };
        }

        if (company.role === "admin") {
            // Do nothing, admins are allowed to do everything
        } else if (company.role === "company") {
            if (Number(id) !== company.id) {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to access this resource",
                    data: null
                };
            }

            if (!company.company_api_key) {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "You don't have any API key, please generate one before using this endpoint",
                    data: null
                };
            }

            // Wrong company API key
            if (company.company_api_key !== req.query["company_api_key"]) {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "API key is not valid in \"company_api_key\" query parameter",
                    data: null
                };
            }
        } else {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "Your account type doesn't allow access to company resources",
                data: null
            };
        }

        if (item_id) {
            object = await this.archiveService.findById(item_id);

            if (object === null) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "Object not found, can't be restored nor removed",
                    data: null
                };
            }
        }

        return [company, object];
    }
}
