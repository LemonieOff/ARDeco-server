import {Body, Controller, Get, Param, Put, Req, Res, UseGuards} from '@nestjs/common';
import {UserService} from './user.service';
import { Request, Response } from "express";
import {AuthGuard} from 'src/auth/auth.guard';
import {JwtService} from '@nestjs/jwt';
import {User} from "./models/user.entity";

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    @Get()
    all() {
        return ['users']
    }

    @UseGuards(AuthGuard)
    @Get('whoami')
    async whoami(@Req() request: Request) {
        const cookie = request.cookies['jwt']
        const data = await this.jwtService.verifyAsync(cookie)
        return this.userService.findOne({id: data['id']})
    }

    @UseGuards(AuthGuard)
    @Put()
    async editViaQuery(@Req() req: Request, @Body() user: User, @Res({passthrough: true}) res: Response) {
        const id = Number(req.query['id']);
        if (id === undefined || isNaN(id)) {
            res.status(400);
            return {
                "status": "KO",
                "code": 400,
                "description": "User was not updated because of an error",
                "error": "User ID must be passed as a query parameter and be a number",
                "data": null
            }
        }
        return await this.editUser(req, Number(req.query["id"]), user, res)
    }

    @UseGuards(AuthGuard)
    @Put(":id")
    async editViaParam(@Req() req: Request, @Param("id") id: number, @Body() user: User, @Res({passthrough: true}) res: Response) {
        return await this.editUser(req, id, user, res)
    }

    async editUser(req: Request, id: number, user: User, res: Response) {
        const cookie = req.cookies['jwt'];
        const data = this.jwtService.verify(cookie);
        const request_user_id = await this.userService.findOne({id: data['id']});
        if (data['id'] != id && request_user_id['role'] != 'admin') {
            res.status(401);
            return {
                "status": "KO",
                "code": 401,
                "description": "You are not allowed to edit this user",
                "data": null
            }
        }
        if (user.role !== undefined && request_user_id['role'] != 'admin') {
            res.status(401);
            return {
                "status": "KO",
                "code": 401,
                "description": "You are not allowed to modify the role of this user",
                "data": null
            }
        }
        try {
            res.status(200);
            return {
                "status": "OK",
                "code": 200,
                "description": "User was updated",
                "data": this.userService.update(data['id'], user)
            }
        } catch (e) {
            res.status(400);
            return {
                "status": "KO",
                "code": 400,
                "description": "User was not updated because of an error",
                "error": e,
                "data": null
            }
        }
    }
}
