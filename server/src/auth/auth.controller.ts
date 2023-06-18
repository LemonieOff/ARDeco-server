import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport'
import { MailService } from '../mail/mail.service';
import { sendMailDTO } from 'src/mail/models/sendMail.dto';
import { LoginDto } from 'src/auth/models/login.dto';

// idclient 720605484975-ohe2u21jk3k6e2cdekgifiliipd4e6oh.apps.googleusercontent.com
// secret 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


@Controller()
export class AuthController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    @Post('register')
    async register(@Body() body: RegisterDto,
        @Res({ passthrough: true }) response: Response) {

        if (body.password != body.password_confirm) {
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
            ///this.mailService.sendMail({"email": body.email, "content": `Salut ${body.first_name}, Bienvenue a toi`}) // To uncomment
            console.log("ID", res.id)
            const jwt = await this.jwtService.signAsync({ id: res.id })
            response.cookie("jwt", jwt, { httpOnly: true })
            return {
                "status": "OK",
                "description": "User was created",
                "code": 100,
                "data": res
            }
        } catch (e) {
            return {
                "status": "KO",
                "description": "Error happen while creating the account",
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


    @Get('register/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        return;
    }


    @Get('callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        if (!req.user) {
            return 'No user from google'
        }
        if (this.userService.findOne({email: req.user.email})) {
            return {
                "status": "KO",
                "description": "User already created",
                "code": 424,
            }
        }
        const body: RegisterDto = {
            "email": req.user.email,
            "password": "12345",
            "password_confirm": "12345",
            "first_name": req.user.firstName,
            "last_name": req.user.lastName,
            "phone": "0000000000",
            "city": "Nantes"
        }
        const res = await this.userService.create(body)
        console.log("ID", res.id)
        const jwt = await this.jwtService.signAsync({ id: res.id })
        response.cookie("jwt", jwt, { httpOnly: true })
        return {
            message: 'User information from google',
            user: req.user
        }
    }


    @Get('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt')
        console.log("Removed jwt token cookie !")
        return "Logout successful"
    }
}
