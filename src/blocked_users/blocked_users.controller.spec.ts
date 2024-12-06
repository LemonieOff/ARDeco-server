import { Test, TestingModule } from "@nestjs/testing";
import { BlockedUsersController } from "./blocked_users.controller";
import { BlockedUsersService } from "./blocked_users.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { BlockedUser } from "./entities/blocked_user.entity";
import { User } from "../user/models/user.entity";
import { HttpStatus } from "@nestjs/common";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("BlockedUsersController", () => {
    let controller: BlockedUsersController;
    let blockedUsersService: BlockedUsersService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockBlockedUser = new BlockedUser();
    mockBlockedUser.id = 2;
    mockBlockedUser.user_id = 1;
    mockBlockedUser.blocked_user_id = 2;
    mockBlockedUser.user = { id: 1 } as User;
    mockBlockedUser.blocked_user = { id: 2, settings: { display_lastname_on_public: true } } as User;

    const mockRequest = {
        cookies: { jwt: "mockJwt" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    const mockUser: User = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "hashedPassword",
        role: "client", // Set a default role
        settings: { display_lastname_on_public: true } as UserSettings,
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
        company_api_key: "",
        cart: null
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlockedUsersController],
            providers: [
                {
                    provide: BlockedUsersService,
                    useValue: {
                        findByBlocker: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        remove: jest.fn(),
                        findByBlocked: jest.fn(),
                        findByBlockedAndBlocking: jest.fn(),
                        checkBlockedForBlocker: jest.fn()
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
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

        controller = module.get<BlockedUsersController>(BlockedUsersController);
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getBlockedUsers", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getBlockedUsers(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to retrieve a user's blocked users list",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getBlockedUsers(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 200 and a list of blocked user IDs", async () => {
            const blockedUsers: BlockedUser[] = [
                { id: 1, user_id: 1, blocked_user_id: 2, user: null, blocked_user: null },
                { id: 2, user_id: 1, blocked_user_id: 3, user: null, blocked_user: null }
            ];
            jest.spyOn(blockedUsersService, "findByBlocker").mockResolvedValue(blockedUsers as any);
            const req = { ...mockRequest, query: {} } as Request;

            const result = await controller.getBlockedUsers(req, mockResponse);

            expect(blockedUsersService.findByBlocker).toHaveBeenCalledWith(1, mockUser);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Blocked users retrieved successfully",
                data: [2, 3]
            });
        });

        it("should return 200 and a list of blocked users with details", async () => {
            const blockedUsers: BlockedUser[] = [
                {
                    id: 1,
                    user_id: 1,
                    blocked_user_id: 2,
                    user: null,
                    blocked_user: {
                        id: 2,
                        first_name: "Blocked",
                        last_name: "User",
                        profile_picture_id: 0,
                        role: "",
                        settings: undefined
                    } as User
                },
                {
                    id: 2,
                    user_id: 1,
                    blocked_user_id: 3,
                    user: null,
                    blocked_user: {
                        id: 3,
                        first_name: "Another",
                        last_name: "Blocked",
                        profile_picture_id: 0,
                        role: "",
                        settings: undefined
                    } as User
                }
            ];
            jest.spyOn(blockedUsersService, "findByBlocker").mockResolvedValue(blockedUsers as any);
            const req = { ...mockRequest, query: { user_details: true } } as unknown as Request;

            const result = await controller.getBlockedUsers(req, mockResponse);

            expect(blockedUsersService.findByBlocker).toHaveBeenCalledWith(1, mockUser);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Blocked users retrieved successfully",
                data: blockedUsers
            });
        });

        it("should return 500 on internal server error", async () => {
            jest.spyOn(blockedUsersService, "findByBlocker").mockRejectedValue(new Error("Some error"));
            const req = { ...mockRequest, query: {} } as Request;
            const consoleSpy = jest.spyOn(console, "error");

            const result = await controller.getBlockedUsers(req, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Internal server error occurring on blocked users fetch",
                data: expect.any(Error)
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("getBlockedUsersForUser", () => {
        it("should return a list of blocked users for a specific user with details", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            user.settings = { display_lastname_on_public: true } as UserSettings;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const blockedUsers = [{
                id: 1,
                user_id: 1,
                blocked_user_id: 2,
                user: null,
                blocked_user: {
                    id: 2,
                    first_name: "Test",
                    last_name: "User",
                    profile_picture_id: 0,
                    role: "",
                    settings: undefined
                }
            }];
            jest.spyOn(blockedUsersService, "findByBlocker").mockResolvedValue(blockedUsers as any);
            const req = { cookies: { jwt: "token" }, query: { user_details: true } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            await controller.getBlockedUsersForUser(req, res, 1);
            expect(blockedUsersService.findByBlocker).toHaveBeenCalledWith(1, user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                code: 200,
                description: "Blocked user retrieved successfully",
                data: blockedUsers
            });
        });

        it("should return 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller.getBlockedUsersForUser(req, res, 1);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return 403 if user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return 400 if user to retrieve is not a number", async () => {
            const user: User = new User;
            user.id = 1;
            user.settings = { display_lastname_on_public: true } as UserSettings;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller.getBlockedUsersForUser(req, res, "NaN" as any);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return 403 if user is not self and not an admin", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            user.settings = { display_lastname_on_public: true } as UserSettings;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return 404 if user to check is not found", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            user.settings = { display_lastname_on_public: true } as UserSettings;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 404,
                data: null
            }));
        });
    });

    describe("blockUser", () => {
        it("should block a user and return 200", async () => {
            const userIdToBlock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(null);
            jest.spyOn(blockedUsersService, "create").mockResolvedValue(mockBlockedUser as any);

            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(blockedUsersService.findOne).toHaveBeenCalledWith(1, userIdToBlock);
            expect(blockedUsersService.create).toHaveBeenCalledWith({
                user_id: 1,
                blocked_user_id: userIdToBlock
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User has been blocked successfully",
                data: null
            });
        });

        it("should return 400 if user ID to block is not a number", async () => {
            const userIdToBlock = "notANumber" as any;
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the user to block/unblock must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const userIdToBlock = 2;
            const result = await controller.blockUser(req, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to block or unblock a user",
                data: null
            });
        });

        it("should return 403 if blocker user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const userIdToBlock = 2;
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 400 if user tries to block themselves", async () => {
            const userIdToBlock = 1; // Same as mockUser.id
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "You cannot block or unblock yourself",
                data: null
            });
        });

        it("should return 404 if user to block is not found", async () => {
            const userIdToBlock = 2;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser) // Blocker user found
                .mockResolvedValueOnce(null); // User to block not found
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "User to block/unblock has not been found",
                data: null
            });
        });

        it("should return 400 if user is already blocked", async () => {
            const userIdToBlock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(mockBlockedUser as any);
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User is already blocked",
                data: null
            });
        });

        it("should return 501 if there's an error blocking the user", async () => {
            const userIdToBlock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(null);
            jest.spyOn(blockedUsersService, "create").mockResolvedValue(null); // Simulate error
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "User has not been blocked because of an error",
                data: null
            });
        });

        it("should return 501 if there's a generic error blocking the user", async () => {
            const userIdToBlock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(null);
            jest.spyOn(blockedUsersService, "create").mockRejectedValue(new Error("Database error"));
            const result = await controller.blockUser(mockRequest, mockResponse, userIdToBlock);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "User has not been blocked because of an error",
                error: expect.any(Error),
                data: expect.any(Error)
            });
        });
    });

    describe("unblockUser", () => {
        it("should unblock a user and return 200", async () => {
            const userIdToUnblock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(mockBlockedUser);
            jest.spyOn(blockedUsersService, "remove").mockResolvedValue({ affected: 1 } as any);

            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(blockedUsersService.findOne).toHaveBeenCalledWith(1, userIdToUnblock);
            expect(blockedUsersService.remove).toHaveBeenCalledWith(1, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User has been unblocked successfully",
                data: null
            });
        });

        // ... (tests for error cases similar to blockUser)
        it("should return 400 if user ID to unblock is not a number", async () => {
            const userIdToUnblock = "notANumber" as any;
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the user to block/unblock must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const userIdToUnblock = 2;
            const result = await controller.unblockUser(req, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to block or unblock a user",
                data: null
            });
        });

        it("should return 403 if blocker user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const userIdToUnblock = 2;
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 400 if user tries to unblock themselves", async () => {
            const userIdToUnblock = 1; // Same as mockUser.id
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "You cannot block or unblock yourself",
                data: null
            });
        });

        it("should return 404 if user to unblock is not found", async () => {
            const userIdToUnblock = 2;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser) // Blocker user found
                .mockResolvedValueOnce(null); // User to unblock not found
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "User to block/unblock has not been found",
                data: null
            });
        });

        it("should return 400 if user is not blocked", async () => {
            const userIdToUnblock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(null);
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User is not blocked",
                data: null
            });
        });

        it("should return 501 if there's a generic error unblocking the user", async () => {
            const userIdToUnblock = 2;
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(mockBlockedUser);
            jest.spyOn(blockedUsersService, "remove").mockRejectedValue(new Error("Database error"));
            const result = await controller.unblockUser(mockRequest, mockResponse, userIdToUnblock);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "User has not been unblocked because of an error",
                error: expect.any(Error),
                data: expect.any(Error)
            });
        });
    });

    describe("checkAuthGet", () => {
        it("should return the user if authorized", async () => {
            const result = await controller["checkAuthGet"](mockRequest, mockResponse);
            expect(result).toEqual(mockUser);
        });

        it("should return 401 if no JWT is provided", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller["checkAuthGet"](req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to retrieve a user's blocked users list",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthGet"](mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 400 if user_id is not a number", async () => {
            const user: User = new User;
            user.id = 1;
            user.settings = { display_lastname_on_public: true } as UserSettings;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await controller["checkAuthGet"](req, res, "NaN" as any);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return 403 if user is not admin and tries to access another user's blocked list", async () => {
            const req = { ...mockRequest, query: {} } as Request;
            mockUser.role = "client"; // Not admin
            const userId = 2; // Different user ID
            const result = await controller["checkAuthGet"](req, mockResponse, userId);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You must be an admin to retrieve this user's blocked users list",
                data: null
            });
        });

        it("should return 404 if target user is not found", async () => {
            const req = { ...mockRequest, query: {} } as Request;
            mockUser.role = "admin";
            const userId = 2;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser) // Admin user found
                .mockResolvedValueOnce(null); // Target user not found
            const result = await controller["checkAuthGet"](req, mockResponse, userId);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "User not found",
                data: null
            });
        });

        it("should return user if authorized as admin", async () => {
            const req = { ...mockRequest, query: {} } as Request;
            mockUser.role = "admin";
            const userId = 2;
            const targetUser = { ...mockUser, id: userId };
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(targetUser as any);
            const result = await controller["checkAuthGet"](req, mockResponse, userId);
            expect(result).toEqual(mockUser);
        });

        it("should return user if trying to access own blocked list", async () => {
            const req = { ...mockRequest, query: {} } as Request;
            mockUser.role = "client"; // Not admin
            const userId = 1; // Same as mockUser.id
            const result = await controller["checkAuthGet"](req, mockResponse, userId);
            expect(result).toEqual(mockUser);
        });
    });

    describe("checkAuthorization", () => {
        it("should return 400 if user_id is not a number", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, "invalid" as any);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the user to block/unblock must be a number",
                data: null
            });
        });

        it("should return 401 if JWT is missing or invalid", async () => {
            const req = { cookies: {} } as Request; // Missing JWT
            const result = await controller["checkAuthorization"](req, mockResponse, 2);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to block or unblock a user",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });


        it("should return 400 if user tries to block/unblock themselves", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, mockUser.id);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "You cannot block or unblock yourself",
                data: null
            });
        });

        it("should return 404 if user to block/unblock is not found", async () => {
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser) // Requesting user found
                .mockResolvedValueOnce(null); // User to block not found

            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "User to block/unblock has not been found",
                data: null
            });
        });

        it("should return the requesting user if all checks pass", async () => {
            const userToBlock = { ...mockUser, id: 2 }; // Different ID
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(userToBlock as any);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, userToBlock.id);
            expect(result).toEqual(mockUser);
        });
    });
});
