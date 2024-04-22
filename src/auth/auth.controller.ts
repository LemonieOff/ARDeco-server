import {
    Body,
    Controller, Delete,
    Get, Param, ParseIntPipe,
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
import { LoginDto } from "src/auth/models/login.dto";
import { CartService } from "src/cart/cart.service";
import { randomBytes } from "crypto";
import { AuthService } from "./auth.service";
// import { use } from 'passport';
import { UserSettingsService } from "../user_settings/user_settings_service";
import { MailService } from "../mail/mail.service";
import { DeleteAccountDto } from "./models/deleteAccount.dto";

@Controller()
export class AuthController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        private cartService: CartService,
        private authService: AuthService,
        private userSettingsService: UserSettingsService
    ) {
    }

    @Post("reset")
    async resetPassword(@Body("email") email: string) {
        console.log("email", email);
        const user = await this.userService.findOne({ email: email });

        if (!user) {
            throw new Error("User not found");
        }
        const resetToken = randomBytes(32).toString("hex");
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1); // Lien valable pendant 1 heure
        await this.authService.createReset({
            email: email,
            link: resetToken
        });
        console.log("rt:", resetToken);

        // this.mailService.sendMailPassword(email, resetToken)
        return resetToken;
    }

    @Post("resetConfirm")
    async confirmReset(@Body("password") password: string, @Body("token") token: string) {
        console.log("passord, token", password, ", ", token);
        const reset = await this.authService.findOneReset({ link: token });
        if (!reset) {
            throw new Error("reset not found");
        }
        console.log(token);
        const user = await this.userService.findOne({ email: reset.email });
        user.password = await bcrypt.hash(password, 12);
        console.log(await this.userService.update(user.id, user));
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
                    status: "KO",
                    description: "E-mail already in use",
                    code: 400,
                    data: null
                };
            }

            const res = await this.userService.create(body);

            // Create settings for the user
            const settings = await this.userSettingsService.create({ user_id: res.id });
            console.log("Settings created for user ", settings.user_id);

            // Send email
            const emailResult = this.mailService.sendWelcomeAndVerification(res.email, "");
            let emailStatus = "";
            if (emailResult instanceof Error) {
                emailStatus = "email was not sent due to an error";
            } else {
                emailStatus = "email was sent";
            }

            // Send JWT token
            const jwt = await this.jwtService.signAsync({
                id: res.id,
                email: res.email
            });
            response.cookie("jwt", jwt, {
                httpOnly: true,
                sameSite: "none",
                secure: true
            });
            response.status(200);
            return {
                status: "OK",
                description: "User was created, " + emailStatus,
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
            response.cookie("jwt", jwt, {
                httpOnly: true,
                sameSite: "none",
                secure: true
            });
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
                description: "ID is not a number"
            };
        }

        const cookie = request.cookies["jwt"];
        if (!cookie) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT must be provided"
            };
        }

        const data = await this.jwtService.verifyAsync(cookie);
        if (!data) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid"
            };
        }

        if (data["id"] !== userID) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid for this user, ID is not the same"
            };
        }

        const usr = await this.userService.findOne({ id: userID });
        if (!usr) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found"
            };
        }

        if (usr && usr.email === data["email"]) {
            response.status(200);
            return {
                status: "OK",
                code: 200,
                description: "JWT is valid for this user"
            };
        } else {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "JWT is not valid for this user, email is not the same"
            };
        }
    }

    @Get("logout")
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie("jwt");
        console.log("Removed jwt token cookie !");
        return {
            status: "OK",
            code: 200,
            description: "Logout successful",
            data: null
        };
    }

    @Delete("close")
    async deleteAccount(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
        @Body() body: DeleteAccountDto
    ) {
        const cookie = request.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: data["id"] });
//        const cart = await this.cartService.findOne({id: usr.cart.id})
        if (!usr) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
                data: null
            };
        }

        if (usr.deleted) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Account already closed",
                data: null
            };
        }

        if (usr.email !== body.email) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Email does not match",
                data: null
            };
        }

        if (body.password !== body.password_confirm) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Passwords do not match",
                data: null
            };
        }

        if (!await bcrypt.compare(body.password, usr.password)) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Password does not match",
                data: null
            };
        }

        // Close account
        const res = await this.userService.update(usr.id, { deleted: true });
        response.clearCookie("jwt");
        console.log("Removed jwt token cookie !");
        return {
            status: "OK",
            code: 200,
            description: "Account closed",
            data: null
        };
    }

    @Delete("close/:id")
    async deleteAccountById(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
        @Param("id", ParseIntPipe) id: number
    ) {
        const cookie = request.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const admin = await this.userService.findOne({ id: data["id"] });
        if (!admin) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
                data: null
            };
        }

        if (admin.role !== "admin") {
            response.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You can't delete account while you are not an admin",
                data: null
            };
        }

        const usr = await this.userService.findOne({ id: Number(request.params.id) });
        if (!usr) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
                data: null
            };
        }

        if (usr.deleted) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Account already closed",
                data: null
            };
        }

        // Close account
        const res = await this.userService.update(usr.id, { deleted: true });
        return {
            status: "OK",
            code: 200,
            description: "Account closed",
            data: null
        };
    }
}
