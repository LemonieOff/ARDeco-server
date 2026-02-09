import { Test, TestingModule } from "@nestjs/testing";
import { CompanyController } from "./company.controller";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { Request, Response } from "express";
import { createHash } from "crypto";

describe("CompanyController", () => {
    let controller: CompanyController;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        first_name: "Test",
        last_name: "Company",
        email: "test@example.com",
        password: "hashedPassword",
        role: "company",
        company_api_key: null,
        settings: undefined,
        galleries: [],
        galleryLikes: [],
        galleryComments: [],
        galleryReports: [],
        feedbacks: [],
        blocking: [],
        blocked_by: [],
        favorite_galleries: [],
        favorite_furniture: [],
        profile_picture_id: 0,
        checkEmailToken: "",
        checkEmailSent: null,
        hasCheckedEmail: false,
        deleted: false,
        city: "",
        phone: "",
        cart: null, googleId: null
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        query: { company_api_key: "mockApiKey" }
    } as unknown as Request;

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompanyController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                        updateToken: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        controller = module.get<CompanyController>(CompanyController);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("generateToken", () => {
        it("should generate a unique token", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null); // Mock no existing token
            // jest.spyOn(randomBytes, "toString").mockReturnValue("randomBytes");

            const token = await controller.generateToken(mockUser);

            const expectedToken = createHash("sha256")
                .update(`${mockUser.id}.${mockUser.first_name}.${mockUser.last_name}.${Date.now()}.randomBytes`)
                .digest("hex");

            expect(userService.findOne).toHaveBeenCalledWith({ company_api_key: expect.any(String) });
            expect(token.length).toEqual(expectedToken.length);
        });

        it("should regenerate token if it already exists", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
            // jest.spyOn(randomBytes, "toString").mockReturnValue("randomBytes");
            const generateTokenSpy = jest.spyOn(controller, "generateToken");

            await controller.generateToken(mockUser);

            expect(userService.findOne).toHaveBeenCalledTimes(2); // Called twice to check and then create
            expect(generateTokenSpy).toHaveBeenCalledTimes(2); // Recursive call
        });

        it("should throw error if max iterations reached", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser); // Always an existing token

            await expect(controller.generateToken(mockUser)).rejects.toThrowError("Max iteration reached");
        });
    });

    describe("requestToken", () => {
        it("should generate and return an API key for a company", async () => {
            const generatedToken = "generatedToken";
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
            jest.spyOn(controller, "generateToken").mockResolvedValue(generatedToken);
            jest.spyOn(userService, "updateToken").mockResolvedValue({} as any);

            const result = await controller.requestToken(mockRequest, mockResponse);

            expect(jwtService.verify).toHaveBeenCalledWith("mockJwt");
            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(controller.generateToken).toHaveBeenCalledWith(mockUser);
            expect(userService.updateToken).toHaveBeenCalledWith(mockUser.id, generatedToken);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "API key generated",
                data: generatedToken,
                token: generatedToken
            });
        });

        it("should return 401 if not connected", async () => {
            const req: Request = { cookies: {} } as Request; // No cookie
            const result = await controller.requestToken(req, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not a company", async () => {
            const nonCompanyUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValue(nonCompanyUser as any);

            const result = await controller.requestToken(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access this resource, you are not a company",
                data: null
            });
        });

        it("should handle generateToken errors", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(controller, "generateToken").mockRejectedValue(new Error("Token generation error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.requestToken(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: "KO",
                code: 500,
                description: "Internal error",
                error: expect.any(Error),
                data: null
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("resetToken", () => {
        it("should reset API key for a company (admin)", async () => {
            const adminUser = { ...mockUser, role: "admin" };
            const companyUser = { ...mockUser, id: 2 }; // Different company user
            const generatedToken = "newGeneratedToken";

            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(adminUser as any) // Requesting user (admin)
                .mockResolvedValueOnce(companyUser as any); // Company to reset
            jest.spyOn(controller, "generateToken").mockResolvedValue(generatedToken);
            jest.spyOn(userService, "updateToken").mockResolvedValue({} as any);
            const req = { ...mockRequest, query: { id: "2" } } as unknown as Request;


            const result = await controller.resetToken(req, mockResponse);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(userService.findOne).toHaveBeenCalledWith({ id: 2 });
            expect(controller.generateToken).toHaveBeenCalledWith(companyUser);
            expect(userService.updateToken).toHaveBeenCalledWith(companyUser.id, generatedToken);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "API key reset",
                data: generatedToken,
                token: generatedToken
            });
        });

        it("should return 401 if not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.resetToken(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if not admin", async () => {
            const nonAdminUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValue(nonAdminUser as any);

            const result = await controller.resetToken(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access this resource, you are not an admin",
                data: null
            });
        });


        it("should handle generateToken errors", async () => {
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValue(adminUser as any);
            jest.spyOn(controller, "generateToken").mockRejectedValue(new Error("Token generation error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.resetToken(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: "KO",
                code: 500,
                description: "Internal error",
                error: expect.any(Error),
                data: null
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
