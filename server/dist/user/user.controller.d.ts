import { UserService } from './user.service';
import { Request } from "express";
import { JwtService } from '@nestjs/jwt';
export declare class UserController {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    all(): string[];
    whoami(request: Request): Promise<import("./models/user.entity").User>;
}
