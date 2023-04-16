"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const bcrypt = require("bcryptjs");
const register_dto_1 = require("./models/register.dto");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async register(body, response) {
        if (body.password != body.password_confirm) {
            return {
                "status": "KO",
                "description": "Password do not match",
                "code": 423,
                "data": body
            };
        }
        const hashed = await bcrypt.hash(body.password, 12);
        body.password = hashed;
        try {
            const res = await this.userService.create(body);
            console.log("ID", res.id);
            const jwt = await this.jwtService.signAsync({ id: res.id });
            response.cookie("jwt", jwt, { httpOnly: true });
            return {
                "status": "OK",
                "description": "User was created",
                "code": 100,
                "data": res
            };
        }
        catch (e) {
            return {
                "status": "KO",
                "description": "Error happen while creating the account",
                "code": 422,
                "data": e
            };
        }
    }
    async logout(response) {
        response.clearCookie('jwt');
        console.log("Removed jwt token cookie !");
        return "Logout successful";
    }
};
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map