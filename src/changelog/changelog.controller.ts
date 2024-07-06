import {
    Body,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    Res
} from '@nestjs/common';
import {ChangelogService} from './changelog.service';
import {UserService} from 'src/user/user.service';
import { Request, Response } from "express";
import {JwtService} from '@nestjs/jwt';
import {Changelog} from './models/changelog.entity';
import {QueryPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {ChangelogDto} from "./models/changelog.dto";

@Controller('changelog')
export class ChangelogController {
    constructor(
        private changelogService: ChangelogService,
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

        //get latest changelog
    @Get('latest')
        async getLatestChangelog(@Res() res: Response) {
        const changelogs = await this.changelogService.all();
        const latestChangelog = changelogs[changelogs.length - 1];
        return res.status(HttpStatus.OK).json(latestChangelog);
    }    

    @Get('')
    async all(@Res() res: Response) {
        const changelogs = await this.changelogService.all();
        return res.status(HttpStatus.OK).json(changelogs);
    }

    @Post('')   
    async create(@Body() data: ChangelogDto, @Req() req: Request, @Res() res: Response) {
        const cookie = req.cookies["jwt"];
        const token = cookie ? this.jwtService.verify(cookie) : null;
        const user = await this.userService.findOne({id: token['id']});
        if (user.role !== 'admin') {
            throw new NotFoundException("User is not an admin!");
        }
        const changelog = await this.changelogService.create(data);
        res.status(HttpStatus.OK);
        return {
            status: 'OK',
            code: HttpStatus.OK,
            description: 'Changelog was created',
            data: changelog,
        };
    }
    @Get(':id')
    async get(@Param('id') id: number, @Res() res: Response) {
        const changelog = await this.changelogService.findOne({ id: id });
        if (!changelog) {
            throw new NotFoundException("Changelog does not exist!");
        }
        return res.status(HttpStatus.OK).json(changelog);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() data: QueryPartialEntity<Changelog>, @Req() req: Request, @Res() res: Response) {
        const cookie = req.cookies["jwt"];
        const token = cookie ? this.jwtService.verify(cookie) : null;
        const user = await this.userService.findOne({id: token['id']});
        if (user.role !== 'admin') {
            return res.status(HttpStatus.FORBIDDEN).json({
                status: 'Forbidden',
                code: HttpStatus.FORBIDDEN,
                description: 'User is not an admin!',
            });
        }
        const changelog = await this.changelogService.update(id, data);
        if (!changelog) {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: 'Not Found',
                code: HttpStatus.NOT_FOUND,
                description: 'Changelog does not exist!',
            });
        }
        return res.status(HttpStatus.OK).json(changelog);
    }
}


