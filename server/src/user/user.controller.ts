import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from "express";
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

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

}
