import { Controller, Delete, Get, Param, Put, Req, Res } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { ArchiveService } from "./archive.service";

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
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;
        const user = await this.userService.findOne({ id: data["id"] });
        console.log("role", user.role);
        console.log("data", data);
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        } else if (user.role == "admin") {
            const objects = await this.archiveService.findAllForCompany(id)
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
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const objects = await this.archiveService.findAllForCompany(
            authorizedCompany.id
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
        @Param("item_id") item_id: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(
            req,
            res,
            company_id,
            item_id
        );
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

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
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const removedObjects =
            await this.archiveService.deleteAllForCompany(
                authorizedCompany.id
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
        @Param("item_id") item_id: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedCompany = await this.checkAuthorization(
            req,
            res,
            company_id,
            item_id
        );
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const restored_object = await this.archiveService.restore(item_id);

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
        id: number, // Company id in normal cases, archive item id in other cases
        object_id: string = null
    ) {
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

        if (id.toString() !== data["id"].toString()) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to access this resource",
                data: null
            };
        }

        if (object_id) {
            const object = await this.archiveService.findByObjectId(object_id);

            if (object === null) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "Object not found, can't be restored nor removed",
                    data: null
                };
            }

            if (object.company.toString() !== data["id"].toString()) {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to restore this object",
                    data: null
                };
            }
        }

        const company = await this.userService.findOne({ id: data["id"] });
        if (!company) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description:
                    "Your user doesn't exists ant can't access this resource",
                data: null
            };
        }

        if (!company["company_api_key"]) {
            res.status(403);
            return {
                status: "KO",
                code: 401,
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
                code: 401,
                description:
                    "API key is not valid in \"company_api_key\" query parameter",
                data: null
            };
        }

        return company;
    }
}
