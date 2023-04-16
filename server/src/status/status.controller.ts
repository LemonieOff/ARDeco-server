import {Controller, Delete, Get, HttpCode, Post, Put} from '@nestjs/common';
import {StatusService} from "./status.service";

@Controller('status')
export class StatusController {
    constructor(private readonly statusService: StatusService) {}

    @Get()
    status() {
        return this.statusService.getStatus();
    }

    @Post()
    @HttpCode(405)
    notAllowedPost() {
        return this.statusService.notAllowed("post");
    }

    @Put()
    @HttpCode(405)
    notAllowedPut() {
        return this.statusService.notAllowed("put");
    }

    @Delete()
    @HttpCode(405)
    notAllowedDelete() {
        return this.statusService.notAllowed("delete");
    }
}
