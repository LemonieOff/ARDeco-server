import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        console.log("request", request);
        try {
            const jwt = request.cookies["jwt"];
            console.log("cookie jwt", jwt);
            return this.jwtService.verify(jwt);
        } catch (err) {
            console.log("Auth guard didn't pass + error: ", err);
            return false;
        }
    }
}
