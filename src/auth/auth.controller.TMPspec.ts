/*
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./models/register.dto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./models/login.dto";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";
// import { MailService } from "../mail/mail.service";

describe("AuthController", () => {
    let authController: AuthController;
    let userService: UserService;
    let jwtService: JwtService;
    //let mailService: MailService;
    let userSettingsService: UserSettingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                UserService,
                JwtService,
                UserSettingsService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    }
                }
            ]
        }).overrideProvider("MailService").useValue({
            sendWelcomeAndVerification: jest.fn().mockReturnValue(new Error("Email sending failed"))
        }).compile();

        authController = module.get<AuthController>(AuthController);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        // mailService = module.get<MailService>(MailService);
        /!*(authController as any).mailService = {
            sendWelcomeAndVerification: jest.fn().mockReturnValue(new Error("Email sending failed"))
        };*!/
        userSettingsService = module.get<UserSettingsService>(UserSettingsService);
    });

    it("should be defined", () => {
        expect(authController).toBeDefined();
    });

    describe("register", () => {
        it("should register a new user and return 200", async () => {
            const registerDto: RegisterDto = {
                email: "test@example.com",
                password: "password",
                password_confirm: "password"
            } as any;

            const mockUser = {
                id: 1,
                email: "test@example.com"
            } as any;

            jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            jest.spyOn(userService, "create").mockResolvedValue(mockUser);
            jest.spyOn(userSettingsService, "create").mockResolvedValue({ user_id: 1 } as any);
            jest.spyOn((authController as any).mailService, "sendWelcomeAndVerification").mockReturnValue({} as any);
            jest.spyOn(jwtService, "signAsync").mockResolvedValue("jwtToken");

            const response = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.register(registerDto, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject({
                status: "OK",
                description: expect.stringContaining("User was created"),
                code: 200,
                data: mockUser
            });
            expect(response.cookie).toHaveBeenCalledWith(
                "jwt",
                "jwtToken",
                expect.any(Object)
            );
        });

        it("should return 400 if passwords do not match", async () => {
            const registerDto: RegisterDto = {
                email: "test@example.com",
                password: "password",
                password_confirm: "differentPassword"
            } as any;

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.register(registerDto, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject({
                status: "KO",
                description: "Password do not match",
                code: 400,
                data: registerDto
            });
        });

        it("should return 400 if email is already in use", async () => {
            const registerDto: RegisterDto = {
                email: "test@example.com",
                password: "password",
                password_confirm: "password"
            } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue({} as User);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.register(registerDto, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject({
                status: "KO",
                description: "E-mail already in use",
                code: 400,
                data: null
            });
        });

        it("should return 422 if an error occurs during user creation", async () => {
            const registerDto: RegisterDto = {
                email: "test@example.com",
                password: "password",
                password_confirm: "password"
            } as any;

            jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            jest.spyOn(userService, "create").mockRejectedValue(new Error("Database error"));

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.register(registerDto, response);

            expect(response.status).toHaveBeenCalledWith(422);
            expect(result).toMatchObject({
                status: "KO",
                description: "Error happen while creating the account",
                code: 422,
                data: expect.any(Error)
            });
        });
    });

    describe("login", () => {
        it("should login a user and return 200", async () => {
            const loginDto: LoginDto = {
                email: "test@example.com",
                password: "password"
            };

            const mockUser = {
                id: 1,
                email: "test@example.com",
                password: "hashedPassword",
                role: "user",
                deleted: false
            } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            jest.spyOn(jwtService, "signAsync").mockResolvedValue("jwtToken");

            const response = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.login(loginDto, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject({
                status: "OK",
                description: "User is successfully logged in",
                code: 200,
                data: {
                    jwt: "jwtToken",
                    userID: 1,
                    role: "user"
                }
            });
            expect(response.cookie).toHaveBeenCalledWith(
                "jwt",
                "jwtToken",
                expect.any(Object)
            );
        });

        it("should return 401 if user is not found", async () => {
            const loginDto: LoginDto = {
                email: "nonexistent@example.com",
                password: "password"
            };

            jest.spyOn(userService, "findOne").mockResolvedValue(null);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.login(loginDto, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                description: "Wrong email or password",
                code: 401,
                data: loginDto.email
            });
        });

        it("should return 401 if user account is deleted", async () => {
            const loginDto: LoginDto = {
                email: "deleted@example.com",
                password: "password"
            };

            const mockUser = {
                id: 1,
                email: "deleted@example.com",
                password: "hashedPassword",
                role: "user",
                deleted: true
            } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.login(loginDto, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                description: "Account deleted",
                code: 401
            });
        });

        it("should return 401 if password is incorrect", async () => {
            const loginDto: LoginDto = {
                email: "test@example.com",
                password: "wrongPassword"
            };

            const mockUser = {
                id: 1,
                email: "test@example.com",
                password: "hashedPassword",
                role: "user",
                deleted: false
            } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.login(loginDto, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                description: "Wrong email or password",
                code: 401
            });
        });

        it("should return 422 if an error occurs during login", async () => {
            const loginDto: LoginDto = {
                email: "test@example.com",
                password: "password"
            };

            const mockUser = {
                id: 1,
                email: "test@example.com",
                password: "hashedPassword",
                role: "user",
                deleted: false
            } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            jest.spyOn(jwtService, "signAsync").mockRejectedValue(new Error("JWT error"));

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.login(loginDto, response);

            expect(response.status).toHaveBeenCalledWith(422);
            expect(result).toMatchObject({
                status: "KO",
                description: "Error happen while creating the account",
                code: 422,
                data: expect.any(Error)
            });
        });
    });

    describe("checkJwt", () => {
        it("should return 200 if JWT is valid for the user", async () => {
            const mockRequest = {
                params: { userID: "1" },
                cookies: { jwt: "validJwtToken" }
            } as any;
            const mockUser = {
                id: 1,
                email: "test@example.com"
            } as any;

            jest.spyOn(jwtService, "verifyAsync").mockResolvedValue({
                id: 1,
                email: "test@example.com"
            });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject({
                status: "OK",
                code: 200,
                description: "JWT is valid for this user"
            });
        });

        // ... Add more test cases for invalid JWT, missing JWT, wrong user ID, etc.
        it("should return 401 if JWT is not provided", async () => {
            const mockRequest = {
                params: { userID: "1" },
                cookies: {} // No JWT
            } as any;

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                code: 401,
                description: "JWT must be provided"
            });
        });

        it("should return 401 if JWT is invalid", async () => {
            const mockRequest = {
                params: { userID: "1" },
                cookies: { jwt: "invalidJwtToken" }
            } as any;

            jest.spyOn(jwtService, "verifyAsync").mockRejectedValue(new Error("Invalid token"));

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                code: 401,
                description: "JWT is not valid"
            });
        });

        it("should return 401 if JWT is for a different user", async () => {
            const mockRequest = {
                params: { userID: "1" },
                cookies: { jwt: "validJwtToken" }
            } as any;

            jest.spyOn(jwtService, "verifyAsync").mockResolvedValue({
                id: 2,
                email: "other@example.com"
            });

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject({
                status: "KO",
                code: 401,
                description: "JWT is not valid for this user, ID is not the same"
            });
        });

        it("should return 422 if userID is not a number", async () => {
            const mockRequest = {
                params: { userID: "notANumber" },
                cookies: { jwt: "validJwtToken" }
            } as any;

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(422);
            expect(result).toMatchObject({
                status: "KO",
                code: 422,
                description: "ID is not a number"
            });
        });

        it("should return 404 if user is not found", async () => {
            const mockRequest = {
                params: { userID: "1" },
                cookies: { jwt: "validJwtToken" }
            } as any;

            jest.spyOn(jwtService, "verifyAsync").mockResolvedValue({
                id: 1,
                email: "test@example.com"
            });
            jest.spyOn(userService, "findOne").mockResolvedValue(null);

            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            const result = await authController.checkJwt(mockRequest, response);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject({
                status: "KO",
                code: 404,
                description: "User not found"
            });
        });
    });
});
*/
