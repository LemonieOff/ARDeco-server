import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PassThrough } from 'stream';
import { AuthGuard } from './auth.guard';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Controller()
export class AuthController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService) { }

    @Post('register')
    async register(@Body() body: RegisterDto,
        @Res({ passthrough: true }) response: Response) {

        if (body.password != body.password_confirm) {
            response.status(423);
            return {
                "status": "KO",
                "description": "Password do not match",
                "code": 423,
                "data": body
            }
        }
        const hashed = await bcrypt.hash(body.password, 12)
        body.password = hashed
        try {
            const res = await this.userService.create(body)
            console.log("ID", res.id)
            const jwt = await this.jwtService.signAsync({ id: res.id })
            response.cookie("jwt", jwt, { httpOnly: true })
            response.status(201);
            return {
                "status": "OK",
                "description": "User was created",
                "code": 100,
                "data": res
            }
        } catch (e) {
            response.status(422);
            return {
                "status": "KO",
                "description": "Error happen while creating the account",
                "code": 422,
                "data": e
            }
        }
    }

    @Get('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt')
        console.log("Removed jwt token cookie !")
        return "Logout successful"
    }
}
