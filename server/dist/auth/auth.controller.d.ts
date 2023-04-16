import { UserService } from 'src/user/user.service';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
export declare class AuthController {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    register(body: RegisterDto, response: Response): Promise<{
        status: string;
        description: string;
        code: number;
        data: any;
    }>;
    logout(response: Response): Promise<string>;
}
