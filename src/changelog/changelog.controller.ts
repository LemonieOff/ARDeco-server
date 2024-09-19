import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, Delete } from "@nestjs/common";
import { ChangelogService } from "./changelog.service";
import { UserService } from "src/user/user.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Changelog } from "./models/changelog.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ChangelogDto } from "./models/changelog.dto";

@Controller("changelog")
export class ChangelogController {
    constructor(
        private changelogService: ChangelogService,
        private jwtService: JwtService,
        private userService: UserService,
    ) {
    }

    @Get("latest")
    async getLatestChangelog(@Res({ passthrough: true }) res: Response) {
        const latestChangelog = await this.changelogService.latest();
        res.status(HttpStatus.OK).json({
            status: "OK",
            code: HttpStatus.OK,
            description: "Latest changelog version",
            data: latestChangelog,
        });
    }

    @Get("")
    async all(@Res({ passthrough: true }) res: Response) {
        const changelogs = await this.changelogService.all();
        res.status(HttpStatus.OK).json({
            status: "OK",
            code: HttpStatus.OK,
            description: "Full changelog",
            data: changelogs,
        });
    }

    @Post("")
    async create(@Body() data: ChangelogDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const cookie = req.cookies["jwt"];
        const token = cookie ? this.jwtService.verify(cookie) : null;

        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            };
        }

        const user = await this.userService.findOne({ id: token["id"] });
        if (!user) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            };
        }

        if (user.role !== "admin") {
            res.status(403);
            return {
                status: "KO",
                code: 401,
                description: "You are not allowed to create a new version into the changelog",
                data: null,
            };
        }

        const changelog = await this.changelogService.create(data);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "Changelog was created",
            data: changelog,
        };
    }

    @Get(":id")
    async get(@Param("id") id: number, @Res({ passthrough: true }) res: Response) {
        const changelog = await this.changelogService.findOne({ id: id });
        if (!changelog) {
            res.status(404).json({
                status: "KO",
                code: 404,
                description: "Changelog not found",
                data: null,
            });
            return;
        }
        res.status(HttpStatus.OK).json({
            status: "OK",
            code: HttpStatus.OK,
            description: `Changelog ${changelog.id} details`,
            data: changelog,
        });
    }

    @Put(":id")
    async update(@Param("id") id: number, @Body() data: QueryPartialEntity<Changelog>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const cookie = req.cookies["jwt"];
        const token = cookie ? this.jwtService.verify(cookie) : null;

        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            };
        }

        const user = await this.userService.findOne({ id: token["id"] });
        if (!user) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            };
        }

        if (user.role !== "admin") {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to update a version in the changelog",
                data: null,
            };
        }

        const oldChangelog = await this.changelogService.findOne({ id: id });
        if (!oldChangelog) {
            res.status(404).json({
                status: "KO",
                code: 404,
                description: "Changelog not found",
                data: null,
            });
            return;
        }

        const changelog = await this.changelogService.update(id, data);
        if (!changelog) {
            res.status(HttpStatus.NOT_FOUND).json({
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Changelog not found",
                data: null,
            });
            return;
        }

        res.status(HttpStatus.OK).json({
            status: "OK",
            code: HttpStatus.OK,
            description: `Changelog ${changelog.id} updated`,
            data: changelog,
        });
    }

    @Delete(":id")
    async delete(@Param("id") id: number, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const cookie = req.cookies["jwt"];
        const token = cookie ? this.jwtService.verify(cookie) : null;

        if (!cookie) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "Vous n'êtes pas connecté",
                data: null,
            };
        }

        const user = await this.userService.findOne({ id: token["id"] });
        if (!user) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "Vous n'êtes pas connecté",
                data: null,
            };
        }

        if (user.role !== "admin") {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "Vous n'êtes pas autorisé à supprimer une version du changelog",
                data: null,
            };
        }

        const result = await this.changelogService.delete(id);
        if (result.affected === 0) {
            res.status(HttpStatus.NOT_FOUND);
            return {
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Changelog non trouvé",
                data: null,
            };
        }

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: `Changelog ${id} supprimé`,
            data: null,
        };
    }
}


