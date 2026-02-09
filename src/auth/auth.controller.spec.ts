import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { UserSettingsService } from "../user_settings/user_settings_service";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { RegisterDto } from "./models/register.dto";
import { LoginDto } from "./models/login.dto";
import { User } from "../user/models/user.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";
import * as bcrypt from "bcryptjs";


describe("AuthController", () => {
    let controller: AuthController;
    let userService: UserService;
    let jwtService: JwtService;
    let mailService: MailService;
    let userSettingsService: UserSettingsService;
    let configService: ConfigService;

    const mockUser: User = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "hashedPassword",
        role: "client",
        settings: { display_lastname_on_public: true } as UserSettings,
        galleries: [], galleryLikes: [], galleryComments: [], galleryReports: [],
        feedbacks: [], blocking: [], blocked_by: [], favorite_galleries: [],
        favorite_furniture: [], profile_picture_id: 0, checkEmailToken: "mockCheckEmailToken",
        checkEmailSent: null, hasCheckedEmail: false, deleted: false, city: null,
        phone: null, company_api_key: null, cart: null, googleId: null
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        body: {}
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
        json: jest.fn(),
        redirect: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        verify: jest.fn(),
                        verifyAsync: jest.fn()
                    }
                },
                {
                    provide: MailService,
                    useValue: {
                        sendWelcomeAndVerification: jest.fn()
                    }
                },
                {
                    provide: UserSettingsService,
                    useValue: {
                        create: jest.fn()
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue("https://ardeco.app")
                    }
                }
            ]
        }).compile();

        controller = module.get<AuthController>(AuthController);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        mailService = module.get<MailService>(MailService);
        userSettingsService = module.get<UserSettingsService>(UserSettingsService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("generateToken", () => {
        it("should generate a random token", () => {
            const token = controller.generateToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });
    });

    describe("checkEmail", () => {
        it("should check and update user email", async () => {
            const req = { ...mockRequest, body: { email: mockUser.email, password: "password", token: "mockCheckEmailToken" } };
            jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce({ ...mockUser, hasCheckedEmail: false });
            jest.spyOn(userService, "update").mockResolvedValueOnce({} as any);
            const result = await controller.checkEmail(req.body.email, req.body.password, req.body.token, mockResponse as Response);

            expect(userService.findOne).toHaveBeenCalledWith({ email: req.body.email });
            expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
            expect(userService.update).toHaveBeenCalledWith(mockUser.id, { hasCheckedEmail: true });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Email address checked successfully"
            });
        });
    });


    describe("register", () => {
        it("should register a new user", async () => {
            const registerDto: RegisterDto = {
                email: "newuser@example.com",
                password: "password",
                password_confirm: "password",
                first_name: "New",
                last_name: "User",
                city: "New City",
                phone: "1234567890"
            };
            const generatedToken = "mockGeneratedToken";
            const signedToken = "mockJwtToken";
            const hashedPassword = "hashedPassword";

            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null); // No existing user
            jest.spyOn(bcrypt, "hash").mockResolvedValueOnce(hashedPassword);
            jest.spyOn(userService, "create").mockResolvedValueOnce({ ...mockUser, email: registerDto.email, checkEmailToken: generatedToken } as any);
            jest.spyOn(userSettingsService, "create").mockResolvedValueOnce({ user: { id: mockUser.id } } as any);
            jest.spyOn(controller, "generateToken").mockReturnValueOnce(generatedToken);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedToken);
            jest.spyOn(mailService, "sendWelcomeAndVerification").mockResolvedValueOnce(undefined);

            const result = await controller.register(registerDto, false, mockResponse as Response);

            expect(userService.findOne).toHaveBeenCalledWith({ email: registerDto.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
            expect(userService.create).toHaveBeenCalledWith(expect.objectContaining({
                email: registerDto.email,
                password: hashedPassword,
                role: "client",
                checkEmailToken: generatedToken
            }));
            expect(userSettingsService.create).toHaveBeenCalledWith({ user: { id: mockUser.id } });
            expect(mailService.sendWelcomeAndVerification).toHaveBeenCalledWith(registerDto.email, generatedToken);
            expect(jwtService.signAsync).toHaveBeenCalledWith({ id: mockUser.id, email: registerDto.email }, { expiresIn: "1d" });
            expect(mockResponse.cookie).toHaveBeenCalledWith("jwt", signedToken, { httpOnly: true, sameSite: "none", secure: true });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                description: "User was created, email was sent",
                code: 201,
                data: {
                    id: mockUser.id,
                    email: registerDto.email,
                    userID: mockUser.id,
                    jwt: signedToken,
                    role: "client"
                }
            });
        });

        it("should set cookie expiration if remember is true", async () => {
            // ... setup similar to the previous test
            const registerDto: RegisterDto = {
                email: "newuser@example.com",
                password: "password",
                password_confirm: "password",
                first_name: "New",
                last_name: "User",
                city: "New City",
                phone: "1234567890"
            };
            const generatedToken = "mockGeneratedToken";
            const signedToken = "mockJwtToken";
            const hashedPassword = "hashedPassword";

            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null); // No existing user
            jest.spyOn(bcrypt, "hash").mockResolvedValueOnce(hashedPassword);
            jest.spyOn(userService, "create").mockResolvedValueOnce({ ...mockUser, email: registerDto.email, checkEmailToken: generatedToken } as any);
            jest.spyOn(userSettingsService, "create").mockResolvedValueOnce({ user: { id: mockUser.id } } as any);
            jest.spyOn(controller, "generateToken").mockReturnValueOnce(generatedToken);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedToken);
            jest.spyOn(mailService, "sendWelcomeAndVerification").mockResolvedValueOnce(undefined);


            await controller.register(registerDto, true, mockResponse as Response);

            // Expect cookie and JWT expiration to be set
            expect(mockResponse.cookie).toHaveBeenCalledWith("jwt", signedToken,
                expect.objectContaining({
                    expires: expect.any(Date),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true
                })
            );
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ expiresIn: "28d" })
            );
        });

        // ... tests for password mismatch, existing user, database errors, email errors
    });


    describe("login", () => {
        it("should log in an existing user", async () => {
            const loginDto: LoginDto = { email: mockUser.email, password: "password" };
            const signedJwt = "mockSignedJwt";
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser as any);
            jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedJwt);

            const result = await controller.login(loginDto, false, mockResponse as Response);

            expect(userService.findOne).toHaveBeenCalledWith({ email: loginDto.email });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(jwtService.signAsync).toHaveBeenCalledWith({ id: mockUser.id, email: mockUser.email }, { expiresIn: "1d" });
            expect(mockResponse.cookie).toHaveBeenCalledWith("jwt", signedJwt, { httpOnly: true, sameSite: "none", secure: true });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                description: "User is successfully logged in",
                code: 200,
                data: { jwt: signedJwt, userID: mockUser.id, role: mockUser.role }
            });
        });

        // ... tests for non-existing user, incorrect password, deleted account, JWT errors
    });

    describe("checkJwt", () => {
        it("should return 200 if JWT is valid", async () => {
            const userId = 1;
            const req = { ...mockRequest, params: { userID: userId.toString() } } as any;
            jest.spyOn(jwtService, "verifyAsync").mockResolvedValueOnce({ id: userId, email: mockUser.email });
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser as any);

            const result = await controller.checkJwt(req, mockResponse as Response);

            expect(jwtService.verifyAsync).toHaveBeenCalledWith(req.cookies.jwt);
            expect(userService.findOne).toHaveBeenCalledWith({ id: userId });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "JWT is valid for this user"
            });
        });
    });

    // ... tests for logout, deleteAccount, deleteAccountById

    describe("googleAuthRedirect", () => {
        it("should login an existing Google user", async () => {
            const googleUser = {
                googleId: "google123",
                email: "google@example.com",
                firstName: "Google",
                lastName: "User"
            };
            const existingUser = { ...mockUser, googleId: "google123", email: "google@example.com" };
            const signedJwt = "mockGoogleJwt";

            const req = { ...mockRequest, user: googleUser } as any;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(existingUser as any);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedJwt);

            await controller.googleAuthRedirect(req, mockResponse as Response);

            expect(userService.findOne).toHaveBeenCalledWith({ googleId: "google123" });
            expect(jwtService.signAsync).toHaveBeenCalledWith(
                { id: existingUser.id, email: existingUser.email },
                { expiresIn: "28d" }
            );
            expect(mockResponse.cookie).toHaveBeenCalledWith("jwt", signedJwt,
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: "none",
                    secure: true
                })
            );
            expect(mockResponse.redirect).toHaveBeenCalledWith(
                `https://ardeco.app/auth/google/callback?jwt=${signedJwt}&userID=${existingUser.id}&role=${existingUser.role}`
            );
        });

        it("should create a new user for a new Google account", async () => {
            const googleUser = {
                googleId: "google456",
                email: "newgoogle@example.com",
                firstName: "New",
                lastName: "GoogleUser"
            };
            const createdUser = { ...mockUser, id: 2, email: "newgoogle@example.com", googleId: "google456" };
            const signedJwt = "mockNewGoogleJwt";

            const req = { ...mockRequest, user: googleUser } as any;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(null)  // No user with this googleId
                .mockResolvedValueOnce(null); // No user with this email
            jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedRandomPassword");
            jest.spyOn(userService, "create").mockResolvedValueOnce(createdUser as any);
            jest.spyOn(userSettingsService, "create").mockResolvedValueOnce({ user: { id: 2 } } as any);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedJwt);

            await controller.googleAuthRedirect(req, mockResponse as Response);

            expect(userService.create).toHaveBeenCalledWith(expect.objectContaining({
                email: "newgoogle@example.com",
                first_name: "New",
                last_name: "GoogleUser",
                role: "client",
                googleId: "google456",
                hasCheckedEmail: true
            }));
            expect(userSettingsService.create).toHaveBeenCalledWith({ user: { id: 2 } });
            expect(mockResponse.redirect).toHaveBeenCalledWith(
                `https://ardeco.app/auth/google/callback?jwt=${signedJwt}&userID=${createdUser.id}&role=${createdUser.role}`
            );
        });

        it("should link Google account to existing user with same email", async () => {
            const googleUser = {
                googleId: "google789",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User"
            };
            const existingUser = { ...mockUser, googleId: null };
            const updatedUser = { ...mockUser, googleId: "google789" };
            const signedJwt = "mockLinkedJwt";

            const req = { ...mockRequest, user: googleUser } as any;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(null)          // No user with this googleId
                .mockResolvedValueOnce(existingUser as any)  // User with this email exists
                .mockResolvedValueOnce(updatedUser as any);  // After update
            jest.spyOn(userService, "update").mockResolvedValueOnce({} as any);
            jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce(signedJwt);

            await controller.googleAuthRedirect(req, mockResponse as Response);

            expect(userService.update).toHaveBeenCalledWith(existingUser.id, { googleId: "google789" });
            expect(mockResponse.redirect).toHaveBeenCalledWith(
                `https://ardeco.app/auth/google/callback?jwt=${signedJwt}&userID=${updatedUser.id}&role=${updatedUser.role}`
            );
        });

        it("should return 401 if no Google user data", async () => {
            const req = { ...mockRequest, user: null } as any;

            const result = await controller.googleAuthRedirect(req, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "Google authentication failed"
            });
        });

        it("should return 401 if Google user account is deleted", async () => {
            const googleUser = {
                googleId: "google123",
                email: "deleted@example.com",
                firstName: "Deleted",
                lastName: "User"
            };
            const deletedUser = { ...mockUser, googleId: "google123", deleted: true };

            const req = { ...mockRequest, user: googleUser } as any;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(deletedUser as any);

            const result = await controller.googleAuthRedirect(req, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "Account deleted"
            });
        });
    });
});
