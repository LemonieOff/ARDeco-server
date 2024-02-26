import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";

import { UserService } from "src/user/user.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./models/register.dto";
import { JwtService } from "@nestjs/jwt";
import { Response, Request } from "express";
// import { AuthGuard } from "@nestjs/passport";
//import { MailService } from "../mail/mail.service";
//import { sendMailDTO } from "src/mail/models/sendMail.dto";
import { LoginDto } from "src/auth/models/login.dto";
import { CatalogService } from "src/catalog/catalog.service";
import { CartService } from "src/cart/cart.service";
import { randomBytes } from "crypto";
import { AuthService } from './auth.service';
// import { use } from 'passport';
import { sendMailPasswordDTO } from "src/mail/models/sendMailPassword";
import { emit } from "process";
import { UserSettingsService } from "../user_settings/user_settings_service";

// idclient 720605484975-ohe2u21jk3k6e2cdekgifiliipd4e6oh.apps.googleusercontent.com
// secret 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

@Controller()
export class AuthController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        //private mailService: MailService,
        private cartService: CartService,
        private authService: AuthService,
        private userSettingsService: UserSettingsService
    ) { }

    @Post('reset')
    async resetPassword(@Body('email') email: string) {
        console.log("email", email)
        const user = await this.userService.findOne({email: email});

        if (!user) {
            throw new Error("User not found");
        }
        const resetToken = randomBytes(32).toString('hex');
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1); // Lien valable pendant 1 heure
        await this.authService.createReset({email: email, link : resetToken})
        console.log("rt:", resetToken)

        let content: sendMailPasswordDTO = {email: email, token: resetToken, user: user.first_name};
        // this.mailService.sendMailPassword(content)
        return resetToken;
      }

      @Post('resetConfirm')
      async confirmReset(@Body('password') password: string, @Body('token') token: string) {
          console.log("passord, token", password, ", ", token)
          const reset = await this.authService.findOneReset({link: token});
          if (!reset) {
            throw new Error('reset not found');
          }
          console.log(token)
          const user = await this.userService.findOne({email: reset.email})
          user.password  = await bcrypt.hash(password, 12)
          console.log(await this.userService.update(user.id, user))
          return "Password changed";
    }

    @Post("register")
    async register(
        @Body() body: RegisterDto,
        @Res({ passthrough: true }) response: Response
    ) {
        if (body.password != body.password_confirm) {
            response.status(400);
            return {
                status: "KO",
                description: "Password do not match",
                code: 400,
                data: body
            };
        }
        const hashed = await bcrypt.hash(body.password, 12);
        body.password = hashed;
        try {
            const existingUser = await this.userService.findOne({ email: body.email });
            if (existingUser) {
                response.status(400);
                return {
                    status: 'KO',
                    description: 'E-mail already in use',
                    code: 400,
                    data: null,
                };
            }

            const res = await this.userService.create(body);

            // Create settings for the user
            const settings = await this.userSettingsService.create({ user_id: res.id });
            console.log("Settings created for user ", settings.user_id);

            // Email sent to the user
            /*let content : sendMailDTO = new sendMailDTO();
            content.email = body.email;
            content.user = body.first_name;
            this.mailService.sendMail(content);
            console.log("ID", res.id);*/

            // Send JWT token
            const jwt = await this.jwtService.signAsync({ id: res.id, email: res.email });
            response.cookie("jwt", jwt, { httpOnly: true, sameSite: "none", secure: true });
            response.status(200);
            return {
                status: "OK",
                description: "User was created",
                code: 200,
                data: res
            };
        } catch (e) {
            console.error(e);
            response.status(422);
            return {
                status: "KO",
                description: "Error happen while creating the account",
                code: 422,
                data: e
            };
        }
    }

    @Post("login")
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) response: Response
    ) {
        const requestedUserByEmail = await this.userService.findOne({
            email: body.email
        });
        if (!requestedUserByEmail) {
            response.status(401);
            return {
                status: "KO",
                description: "Wrong email or password",
                code: 401,
                data: body.email
            };
        }
        if (requestedUserByEmail.deleted) {
            response.status(401);
            return {
                status: "KO",
                description: "Account deleted",
                code: 401
            };
        }
        if (
            !(await bcrypt.compare(
                body.password,
                requestedUserByEmail.password
            ))
        ) {
            response.status(401);
            return {
                status: "KO",
                description: "Wrong email or password",
                code: 401
            };
        }
        try {
            const jwt = await this.jwtService.signAsync({
                id: requestedUserByEmail.id,
                email: requestedUserByEmail.email
            });
            response.cookie("jwt", jwt, { httpOnly: true, sameSite: "none", secure: true });
            response.status(200);
            return {
                status: "OK",
                description: "User is successfully logged in",
                code: 200,
                data: {
                    jwt: jwt,
                    userID: requestedUserByEmail.id,
                    role: requestedUserByEmail.role
                }
            };
        } catch (e) {
            response.status(422);
            return {
                status: "KO",
                description: "Error happen while creating the account",
                code: 422,
                data: e
            };
        }
    }

    @Get("checkjwt/:userID")
    async checkJwt(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const userID = Number(request.params.userID);

        if (isNaN(userID)) {
            response.status(422);
            return {
                status: "KO",
                code: 422,
                description: "ID is not a number",
            };
        }

        const cookie = request.cookies['jwt'];
        if (!cookie) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT must be provided",
            };
        }

        const data = await this.jwtService.verifyAsync(cookie);
        if (!data) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid",
            };
        }

        if (data['id'] !== userID) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid for this user, ID is not the same",
            };
        }

        const usr = await this.userService.findOne({ id: userID });
        if (!usr) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
            };
        }

        if (usr && usr.email === data['email']) {
            response.status(200);
            return {
                status: "OK",
                code: 200,
                description: "JWT is valid for this user",
            };
        } else {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid for this user, email is not the same",
            };
        }
    }

    /*
    @Get("register/google")
    @UseGuards(AuthGuard("google"))
    async googleAuth(@Req() req) {
        return;
    }

    @Get("callback")
    @UseGuards(AuthGuard("google"))
    async googleAuthRedirect(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        if (!req.user) {
            return "No user from google";
        }
        console.log("req :", req)
        const user = await this.userService.findOne({email: req.user.email});
        if (user) {
            const jwt = await this.jwtService.signAsync({ id: user.id, email: user.email });
            response.cookie("jwt", jwt, { httpOnly: true, sameSite: "none", secure: true });
            response.status(200);
            return {
                "status": "OK",
                "description": "User is successfully logged in",
                "code": 200,
                "data": {
                    "jwt": jwt,
                    "userID": user.id,
                }
            }

            // Double return ???
            /*return {
                status: "KO",
                description: "User already created",
                code: 424
            };*\/
        }
        const body = {
            email: req.user.email,
            password: "12345",
            password_confirm: "12345",
            first_name: req.user.firstName,
            last_name: req.user.lastName,
            phone: "0000000000",
            city: "Nantes",
            deleted: false
        };
        const res = await this.userService.create(body);
        console.log("ID", res.id);
        const jwt = await this.jwtService.signAsync({ id: res.id, email: res.email });
        response.cookie("jwt", jwt, { httpOnly: true, sameSite: "none", secure: true });
        return {
            message: "User information from google",
            user: req.user
        };
    }
     */

    @Get("logout")
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie("jwt");
        console.log("Removed jwt token cookie !");
        return "Logout successful";
    }

    @Get("close")
    async deleteAccount(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request
    ) {
        const cookie = request.cookies['jwt']
        const data = await this.jwtService.verifyAsync(cookie)
		    console.log("id : ", data['id'])
        const usr = await this.userService.findOne({ id: data['id'] })
//        const cart = await this.cartService.findOne({id: usr.cart.id})
        this.userService.update(usr.id, {deleted: true})
        response.clearCookie('jwt')
        
        console.log("Removed jwt token cookie !")
        return {
            status: "OK",
            code: 200,
            description: "Account closed",
            data: null
        };
    }
}
