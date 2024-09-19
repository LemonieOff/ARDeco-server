import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteGalleryController } from "./favorite_gallery.controller";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";
import { User } from "../user/models/user.entity";
import { FavoriteGallery } from "./models/favorite_gallery.entity";
import { Gallery } from "../gallery/models/gallery.entity";
import { Request, Response } from "express";

describe("FavoriteGalleryController", () => {
    let controller: FavoriteGalleryController;
    let favoriteGalleryService: FavoriteGalleryService;
    let userService: UserService;
    let galleryService: GalleryService;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.role = "client";

    const mockGallery = new Gallery();
    mockGallery.id = 10;
    mockGallery.user = mockUser;
    mockGallery.user_id = mockUser.id;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FavoriteGalleryController],
            providers: [
                {
                    provide: FavoriteGalleryService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockResolvedValue({ id: 1 })
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: GalleryService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockGallery)
                    }
                }
            ]
        }).compile();

        controller = module.get<FavoriteGalleryController>(FavoriteGalleryController);
        favoriteGalleryService = module.get<FavoriteGalleryService>(FavoriteGalleryService);
        userService = module.get<UserService>(UserService);
        galleryService = module.get<GalleryService>(GalleryService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("all", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.all(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if user has no favorite gallery items", async () => {
            jest.spyOn(favoriteGalleryService, "findAll").mockResolvedValue([]);
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You don't have any favorite gallery items",
                data: []
            });
        });

        it("should return 200 and favorite gallery items", async () => {
            const mockFavoriteGalleries: FavoriteGallery[] = [
                {
                    gallery_id: 10, user_id: 1, timestamp: new Date(),
                    id: 0
                }
            ];
            const expectedGalleryData = {
                id: 10,
                name: mockGallery.name,
                description: mockGallery.description,
                room: mockGallery.room,
                style: mockGallery.style,
                model_data: mockGallery.model_data,
                user: {
                    id: 1,
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    profile_picture_id: mockUser.profile_picture_id
                }
            };

            jest.spyOn(favoriteGalleryService, "findAll").mockResolvedValue(mockFavoriteGalleries);
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Favorite Gallery items",
                data: [expectedGalleryData]
            });
        });

        it("should handle errors gracefully", async () => {
            jest.spyOn(galleryService, "findOne").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const result = await controller.all(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Favorite Gallery list was not display because of an error",
                error: expect.any(Error),
                data: null
            });
        });
    });

    describe("post", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.post(req, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.post(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 400 if gallery_id is not a number", async () => {
            const user = new User();
            jest.spyOn(controller, "checkAuthorization").mockResolvedValueOnce(user);
            const result = await controller.post(mockRequest, NaN, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Gallery id is not a number",
                data: null
            });
        });

        it("should return 404 if gallery does not exist", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.post(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You are not allowed to add this gallery to your favorites because it does not exist",
                data: null
            });
        });

        it("should return 409 if gallery is already in favorites", async () => {
            const mockFavoriteGallery = {
                id: 1,
                gallery_id: 10,
                user_id: 1,
                timestamp: new Date()
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            const result = await controller.post(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "You already have this gallery in your favorites",
                data: null
            });
        });

        it("should add gallery to favorites and return 201", async () => {
            const newFavGallery = {
                id: 1,
                user_id: 1,
                gallery_id: 10,
                timestamp: new Date()
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(favoriteGalleryService, "create").mockResolvedValueOnce(newFavGallery);
            const result = await controller.post(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Gallery item was added to your favorites",
                data: newFavGallery
            });
        });

        it("should handle errors during adding gracefully", async () => {
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(favoriteGalleryService, "create").mockRejectedValue(new Error("Database error"));
            const result = await controller.post(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Gallery item was not added to your favorites because of an error",
                error: expect.any(Error),
                data: null
            });
        });
    });

    describe("deleteItem", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.deleteItem(req, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if gallery is not in favorites", async () => {
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This gallery item is not in this user's favorites gallery list",
                data: null
            });
        });

        it("should return 403 if user is not admin and not the owner of the favorite item", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 2,
                gallery_id: 10
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should delete gallery from favorites and return 200 if user is admin", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 2,
                gallery_id: 10
            } as FavoriteGallery;
            mockUser.role = "admin";
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            jest.spyOn(favoriteGalleryService, "delete").mockResolvedValueOnce({ affected: 1 });
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Favorite gallery item has successfully been deleted from your favorites",
                data: mockFavoriteGallery
            });
        });

        it("should delete gallery from favorites and return 200 if user is owner", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 1,
                gallery_id: 10
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            jest.spyOn(favoriteGalleryService, "delete").mockResolvedValueOnce({ affected: 1 });
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Favorite gallery item has successfully been deleted from your favorites",
                data: mockFavoriteGallery
            });
        });

        it("should handle errors during deletion gracefully", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 1,
                gallery_id: 10
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            jest.spyOn(favoriteGalleryService, "delete").mockRejectedValueOnce(new Error("Database error"));
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "OK", // Note: This is likely a typo in the original code, should be 'KO'
                code: 501,
                description: "Server error",
                data: expect.any(Error)
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller["checkAuthorization"](req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user if type is not 'delete'", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse);
            expect(result).toEqual(mockUser);
        });

        it("should return 404 if gallery is not found in favorites (delete)", async () => {
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "delete");
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This gallery item is not in this user's favorites gallery list",
                data: null
            });
        });

        it("should return 403 if user is not admin and not the owner (delete)", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 2,
                gallery_id: 10
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            const localUser = new User();
            Object.assign(localUser, mockUser, { role: "client" });
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(localUser);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "delete");
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user if user is admin (delete)", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 2,
                gallery_id: 10
            } as FavoriteGallery;
            mockUser.role = "admin";
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "delete");
            expect(result).toEqual(mockUser);
        });

        it("should return user if user is the owner (delete)", async () => {
            const mockFavoriteGallery = {
                id: 1,
                user_id: 1,
                gallery_id: 10
            } as FavoriteGallery;
            jest.spyOn(favoriteGalleryService, "findOne").mockResolvedValueOnce(mockFavoriteGallery);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "delete");
            expect(result).toEqual(mockUser);
        });
    });
});
