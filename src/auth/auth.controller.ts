import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Res } from "@nestjs/common";

import { UserService } from "src/user/user.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./models/register.dto";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { Request, Response } from "express";
// import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "src/auth/models/login.dto";
// import { CartService } from "src/cart/cart.service";
import { randomBytes } from "crypto";
// import { AuthService } from "./auth.service";
// import { use } from 'passport';
import { UserSettingsService } from "../user_settings/user_settings_service";
import { MailService } from "../mail/mail.service";
import { User } from "../user/models/user.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DeleteAccountDto } from "./models/deleteAccount.dto";

@Controller()
export class AuthController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        // private cartService: CartService,
        // private authService: AuthService,
        private userSettingsService: UserSettingsService
    ) {
    }

    private generateToken(size: number = 64, encoding: BufferEncoding = "hex") {
        return randomBytes(size).toString(encoding);
    }

    /*@Post("reset")
    async resetPassword(@Body("email") email: string) {
        console.log("email", email);
        const user = await this.userService.findOne({ email: email });

        if (!user) {
            throw new Error("User not found");
        }
        const resetToken = this.generateToken();
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
        const reset = await this.authService.findOneReset({ link: token });
        if (!reset) {
            throw new Error("reset not found");
        }
        console.log(token);
        const user = await this.userService.findOne({ email: reset.email });
        user.password = await bcrypt.hash(password, 12);
        console.log(await this.userService.update(user.id, user));
        return "Password changed";
    }*/

    @Post(["checkEmail", "check-email"])
    async checkEmail(
        @Body("email") email: string,
        @Body("password") password: string,
        @Body("token") token: string,
        @Res({ passthrough: true }) response: Response) {
        if (!email || !password || !token) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Email, password and token must be provided"
            };
        }
        const user = await this.userService.findOne({ email: email });
        if (!user) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found"
            };
        }
        if (!await bcrypt.compare(password, user.password)) {
            response.status(401);
            return {
                status: "KO",
                code: 401,
                description: "Password is not valid"
            };
        }
        if (user.checkEmailToken !== token) {
            response.status(401);
            return {
                status: "KO",
                code: 400,
                description: "Token is not valid"
            };
        }
        if (user.hasCheckedEmail) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Email already checked"
            };
        }
        await this.userService.update(user.id, { hasCheckedEmail: true });
        response.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Email address checked successfully"
        };
    }

    @Post("register")
    async register(
        @Body() body: RegisterDto,
        @Body("remember") remember: boolean,
        @Res({ passthrough: true }) response: Response
    ) {
        try {
            if (body.password !== body.password_confirm) {
                response.status(400);
                return {
                    status: "KO",
                    description: "Password does not match",
                    code: 400,
                    data: null
                };
            }

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

            const hashed = await bcrypt.hash(body.password, 12);

            const user: QueryPartialEntity<User> = {
                email: body.email,
                first_name: body.first_name,
                last_name: body.last_name,
                phone: body.phone,
                city: body.city,
                password: hashed,
                role: "client",
                checkEmailToken: this.generateToken()
            };

            const res = await this.userService.create(user);

            // Create settings for the user
            const settings = await this.userSettingsService.create({
                user: {
                    id: res.id
                }
            });
            console.log("Settings created for user ", settings.user.id);

            // Send email
            const emailResult = this.mailService.sendWelcomeAndVerification(res.email, res.checkEmailToken);
            let emailStatus = "";
            if (emailResult instanceof Error) {
                emailStatus = "email was not sent due to an error";
            } else {
                emailStatus = "email was sent";
                await this.userService.update(res.id, { checkEmailSent: new Date() });
            }

            // Create cookie options for JWT token based on remember me value
            let cookieOptions = {
                httpOnly: true,
                sameSite: "none",
                secure: true
            };
            let jwtOptions: JwtSignOptions = {};
            if (remember) {
                console.log(user.email + " : Remember me !");
                cookieOptions["expires"] = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4); // 1 month
                jwtOptions = { expiresIn: "28d" };
            } else {
                console.log(user.email + " : No remember me !");
                jwtOptions = { expiresIn: "1d" };
            }

            // Send JWT token
            const jwt = await this.jwtService.signAsync({
                id: res.id,
                email: res.email
            }, jwtOptions);

            response.cookie("jwt", jwt, cookieOptions as any);
            response.status(201);
            return {
                status: "OK",
                description: "User was created, " + emailStatus,
                code: 201,
                data: {
                    id: res.id,
                    email: res.email,
                    userID: res.id,
                    jwt: jwt,
                    role: res.role
                }
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
        @Body("remember") remember: boolean,
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
            // Create cookie options for JWT token based on remember me value
            let cookieOptions = {
                httpOnly: true,
                sameSite: "none",
                secure: true
            };
            let jwtOptions: JwtSignOptions = {};
            if (remember) {
                console.log(requestedUserByEmail.email + " : Remember me !");
                cookieOptions["expires"] = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 4); // 1 month
                jwtOptions = { expiresIn: "28d" };
            } else {
                console.log(requestedUserByEmail.email + " : No remember me !");
                jwtOptions = { expiresIn: "1d" };
            }

            // Send JWT token
            const jwt = await this.jwtService.signAsync({
                id: requestedUserByEmail.id,
                email: requestedUserByEmail.email
            }, jwtOptions);

            response.cookie("jwt", jwt, cookieOptions as any);
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
        response.cookie("jwt", "", {
            expires: new Date(0),
            httpOnly: true,
            sameSite: "none",
            secure: true
        });
        console.log("Removed jwt token cookie !");
        return {
            status: "OK",
            code: 200,
            description: "Logout successful",
            data: null
        };
    }

    @Delete("close")
    async deleteAccountDelete(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
        @Body() body: DeleteAccountDto
    ) {
        await this.deleteAccount(response, request, body);
    }

    @Post("close")
    async deleteAccountPost(
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
        @Body() body: DeleteAccountDto
    ) {
        await this.deleteAccount(response, request, body);
    }

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
                data: "user_notConnected"
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
                data: "user_notFound"
            };
        }

        if (usr.deleted) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Account already closed",
                data: "user_alreadyClosed"
            };
        }

        if (usr.email !== body.email) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Email does not match",
                data: "user_emailDoesNotMatch"
            };
        }

        if (body.password !== body.password_confirm) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Passwords do not match",
                data: "user_passwordsDoNotMatch"
            };
        }

        if (!await bcrypt.compare(body.password, usr.password)) {
            response.status(400);
            return {
                status: "KO",
                code: 400,
                description: "Wrong password",
                data: "user_wrongPassword"
            };
        }

        // Close account
        const res = await this.userService.update(usr.id, { deleted: true });
        response.cookie("jwt", "", {
            expires: new Date(0),
            httpOnly: true,
            sameSite: "none",
            secure: true
        });
        console.log("Removed jwt token cookie !");
        response.status(200);
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
                data: "user_notConnected"
            };
        }

        const admin = await this.userService.findOne({ id: data["id"] });
        if (!admin) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
                data: "user_notFound"
            };
        }

        if (admin.role !== "admin") {
            response.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You can't delete account while you are not an admin",
                data: "user_notAdmin"
            };
        }

        const usr = await this.userService.findOne({ id: Number(request.params.id) });
        if (!usr) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "User not found",
                data: "user_notFound"
            };
        }

        if (usr.deleted) {
            response.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Account already closed",
                data: "user_alreadyClosed"
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
