import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { LoginDto } from './models/login.dto';
import { JwtService } from '@nestjs/jwt';
import {Request, Response} from 'express';
import { PassThrough } from 'stream';
import { AuthGuard } from './auth.guard';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {QueryPartialEntity} from "typeorm/query-builder/QueryPartialEntity";
import {User} from "../user/models/user.entity";

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
                "description": "Error happen during login",
                "code": 422,
                "data": e
            }
        }
    }

    @Post('login')
    async login(@Body() body: LoginDto,
                @Res({ passthrough: true }) response: Response) {
        const requestedUserByEmail = await this.userService.findOne({email: body.email})
        if (!requestedUserByEmail) {
            response.status(401);
            return {
                "status": "KO",
                "description": "Wrong email or password",
                "code": 401,
                "data": body.email
            }
        }
        if (!await bcrypt.compare(body.password, requestedUserByEmail.password)) {
            response.status(401);
            return {
                "status": "KO",
                "description": "Wrong email or password",
                "code": 401,
            }
        }
        try {
            const jwt = await this.jwtService.signAsync({ id: requestedUserByEmail.id })
            response.cookie("jwt", jwt, { httpOnly: true })
            response.status(200);
            return {
                "status": "OK",
                "description": "User is successfully logged in",
                "code": 200,
                "data": {
                    "jwt": jwt,
                    "userID": requestedUserByEmail.id,
                }
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
