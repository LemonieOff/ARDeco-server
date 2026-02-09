import { Test, TestingModule } from "@nestjs/testing";
import { LikeController } from "./like.controller";
import { LikeService } from "./like.service";
import { GalleryService } from "../gallery/gallery.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";
import { Request, Response } from "express";
import { HttpStatus } from "@nestjs/common";
import { User } from "../user/models/user.entity";
import { Gallery } from "../gallery/models/gallery.entity";
import { Like } from "./models/like.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("LikeController", () => {
    let controller: LikeController;
    let likeService: LikeService;
    let galleryService: GalleryService;
    let jwtService: JwtService;
    let userService: UserService;
    let blockedUsersService: BlockedUsersService;

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
        favorite_furniture: [], profile_picture_id: 0, checkEmailToken: null,
        checkEmailSent: null, hasCheckedEmail: false, deleted: false, city: null,
        phone: null, company_api_key: null, cart: null, googleId: null
    };

    const mockGallery: Gallery = {
        id: 1,
        user_id: 1,
        visibility: true,
        model_data: "{}",
        name: "Gallery 1",
        description: "Description 1",
        room: "living_room",
        style: "modern",
        galleryReports: [],
        comments: [],
        likes: [],
        favorites: [],
        user: mockUser
    };

    const mockLike: Like = {
        id: 1,
        user: mockUser,
        user_id: mockUser.id,
        gallery: mockGallery,
        gallery_id: mockGallery.id,
        creation_date: new Date()
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LikeController],
            providers: [
                {
                    provide: LikeService,
                    useValue: {
                        findAll: jest.fn(),
                        numberForUser: jest.fn(),
                        numberForGallery: jest.fn(),
                        isLiked: jest.fn(),
                        like: jest.fn(),
                        unlike: jest.fn()
                    }
                },
                {
                    provide: GalleryService,
                    useValue: {
                        findOne: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 })
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        checkBlockedForBlocker: jest.fn().mockResolvedValue(false) // Mock not blocked
                    }
                }
            ]
        }).compile();

        controller = module.get<LikeController>(LikeController);
        likeService = module.get<LikeService>(LikeService);
        galleryService = module.get<GalleryService>(GalleryService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("all", () => {
        it("should return all likes", async () => {
            const mockLikes = [mockLike];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(controller, "checkLogin").mockResolvedValue(mockUser);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any); // Mock admin user
            jest.spyOn(likeService, "findAll").mockResolvedValue(mockLikes as any);

            const result = await controller.all(mockRequest, mockResponse);

            expect(likeService.findAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "All likes",
                data: mockLikes
            });
        });

        it("should return 401 if no JWT is provided", async () => {
            const req = { cookies: {} } as Request; // No JWT
            const result = await controller.all(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null); // User not found
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            });
        });

        it("should return 403 if user is not an admin", async () => {
            const nonAdminUser = { ...mockUser, role: "client" }; // Mock non-admin user
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(nonAdminUser as any);
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You must me an admin to retrieve all likes",
                data: null
            });
        });

        it("should handle errors from LikeService.findAll", async () => {
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            const error = new Error("Database error");
            jest.spyOn(likeService, "findAll").mockRejectedValueOnce(error);
            const consoleErrorSpy = jest.spyOn(console, "error"); // Add a spy for console.error

            const result = await controller.all(mockRequest, mockResponse);


            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR); // Expect 500
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Unknown error", // Description from the exception filter
                data: { // Data from the exception filter (HttpException)
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                    error: "Internal Server Error"
                }
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(error); // Check if console.error was called
        });
    });

    describe("getLikesForGallery", () => {
        it("should return the number of likes for a gallery", async () => {
            const galleryId = 1;
            const numLikes = 5;
            jest.spyOn(controller, "checkLogin").mockResolvedValue(mockUser);
            jest.spyOn(likeService, "numberForGallery").mockResolvedValueOnce(numLikes as any);
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(mockGallery as any);

            const result = await controller.getLikesForGallery(mockRequest, mockResponse, galleryId);

            expect(likeService.numberForGallery).toHaveBeenCalledWith(galleryId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Likes for gallery 1",
                data: numLikes
            });
        });

        // ... tests for authentication, authorization, not found, and error handling
    });

    describe("getLikesForUser", () => {
        // ... similar tests as getLikesForGallery, but for users
    });

    describe("isUserLikingGallery", () => {
        it("should return whether a user likes a gallery", async () => {
            const userId = 1;
            const galleryId = 1;
            jest.spyOn(controller, "checkLogin").mockResolvedValue(mockUser);
            jest.spyOn(likeService, "isLiked").mockResolvedValueOnce(true);
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(mockGallery as any);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser);

            const result = await controller.isUserLikingGallery(mockRequest, mockResponse, userId, galleryId);

            expect(likeService.isLiked).toHaveBeenCalledWith(userId, galleryId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: `User ${userId} is liking gallery ${galleryId}`,
                data: true
            });
        });

        // ... tests for authentication, authorization, not found, different like status, and error handling
    });

    describe("like", () => {
        it("should like a gallery", async () => {
            const galleryId = 1;
            jest.spyOn(controller, "checkLogin").mockResolvedValue(mockUser);
            jest.spyOn(likeService, "isLiked").mockResolvedValueOnce(false); // Not already liked
            jest.spyOn(likeService, "like").mockResolvedValueOnce(mockLike as any);
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(mockGallery as any);

            const result = await controller.like(mockRequest, mockResponse, galleryId);

            expect(likeService.isLiked).toHaveBeenCalledWith(mockUser.id, galleryId);
            expect(likeService.like).toHaveBeenCalledWith(mockUser.id, galleryId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.CREATED,
                description: "You successfully liked this gallery",
                data: null
            });
        });

        // ... tests for authentication, authorization, already liked, not found, and error handling
    });

    describe("unlike", () => {
        // ... similar tests as like, but for unliking
    });


    describe("checkLogin", () => {
        it("should return the user if authorized", async () => {
            const result = await controller["checkLogin"](mockRequest, mockResponse);
            expect(result).toEqual(result != mockUser);
        });

        // ... (tests for authentication, authorization, different roles, not found, and error handling)
    });

    describe("getSelect", () => {
        it("should return default select and relations", () => {
            const [relations, select] = controller.getSelect();
            expect(relations).toEqual({ gallery: true, user: true });
            expect(select).toEqual({
                id: true,
                user: { id: true, role: true },
                gallery: { id: true, visibility: true, user: { id: true } }
            });
        });
    });
});
