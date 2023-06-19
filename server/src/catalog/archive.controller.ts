import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Catalog } from "./models/catalog.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
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
    async get(@Req() req: Request, @Param("id") id: number, @Res({ passthrough: true }) res: Response) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const objects = await this.archiveService.findAllObjectsFromCompany(authorizedCompany.id);

        if (objects === null) {
            res.status(400);
            return {
                "status": "KO",
                "code": 400,
                "description": "Objects not found",
                "data": null
            };
        }
        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Objects list",
            "data": objects
        };
    }


    @Delete(":id")
    async removeAll(@Req() req: Request, @Param("id") id: number, @Res({ passthrough: true }) res: Response) {
        const authorizedCompany = await this.checkAuthorization(req, res, id);
        if (!(authorizedCompany instanceof User)) return authorizedCompany;

        const removedObjects = await this.archiveService.deleteAllObjectsFromCompany(authorizedCompany.id);
        if (removedObjects === null) {
            res.status(400);
            return {
                "status": "KO",
                "code": 400,
                "description": "Objects not removed",
                "data": null
            };
        }

        res.status(200);
        return {
            "status": "OK",
            "code": 200,
            "description": "Objects removed",
            "data": removedObjects
        };
    }

    async checkAuthorization(req: Request, res: Response, id: number) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                "status": "KO",
                "code": 401,
                "description": "You are not connected",
                "data": null
            };
        }

        // Targeted company id is not the same as the one in the JWT
        if (id.toString() !== data["id"].toString()) {
            res.status(403);
            return {
                "status": "KO",
                "code": 403,
                "description": "You are not allowed to access this resource",
                "data": null
            };
        }

        const company = await this.userService.findOne({ id: data["id"] });
        if (!company) {
            res.status(403);
            return {
                "status": "KO",
                "code": 403,
                "description": "Your user doesn't exists ant can't access this resource",
                "data": null
            };
        }

        if (!company["company_api_key"]) {
            res.status(403);
            return {
                "status": "KO",
                "code": 401,
                "description": "You don't have any API key, please generate one before using this endpoint",
                "data": null
            };
        }

        // Wrong company API key
        if (company.company_api_key !== req.query["company_api_key"]) {
            res.status(403);
            return {
                "status": "KO",
                "code": 401,
                "description": "API key is not valid in \"company_api_key\" query parameter",
                "data": null
            };
        }

        return company;
    }
}
