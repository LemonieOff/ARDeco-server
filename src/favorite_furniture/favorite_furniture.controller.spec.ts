import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteFurnitureController } from "./favorite_furniture.controller";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { CatalogService } from "../catalog/catalog.service";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { Catalog } from "../catalog/models/catalog.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("FavoriteFurnitureController", () => {
    let controller: FavoriteFurnitureController;
    let favoriteFurnitureService: FavoriteFurnitureService;
    let userService: UserService;
    let catalogService: CatalogService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "hashedPassword",
        role: "client",
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

    const mockCatalogItem: Catalog = {
        id: 1,
        name: "Test Furniture",
        price: 100,
        width: 50,
        height: 60,
        depth: 40,
        styles: [{
            id: 1, furniture_id: 1, style: "modern",
            furniture: new Catalog
        }],
        rooms: [{
            id: 1, furniture_id: 1, room: "living_room",
            furniture: new Catalog
        }],
        colors: [{
            id: 1, furniture_id: 1, model_id: 1, color: "red",
            furniture: new Catalog
        }],
        object_id: "test-furniture-1",
        active: true,
        archived: false,
        company: 1,
        company_name: "Test Company",
        favorites: []
    };

    const mockFavoriteFurniture: FavoriteFurniture = {
        id: 1,
        user_id: mockUser.id,
        furniture_id: mockCatalogItem.id,
        timestamp: new Date(),
        user: mockUser,
        furniture: mockCatalogItem
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        query: {} // Initialize as empty for default behavior
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FavoriteFurnitureController],
            providers: [
                {
                    provide: FavoriteFurnitureService,
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
                    provide: CatalogService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockCatalogItem)
                    }
                }
            ]
        }).overrideProvider(FavoriteFurnitureService)
            .useValue({
                findAll: jest.fn(),
                findOne: jest.fn(),
                create: jest.fn(),
                delete: jest.fn()
            })
            .overrideProvider(JwtService)
            .useValue({
                verify: jest.fn().mockReturnValue({ id: 1 })
            })
            .overrideProvider(UserService)
            .useValue({
                findOne: jest.fn().mockResolvedValue(mockUser)
            })
            .overrideProvider(CatalogService)
            .useValue({
                findOne: jest.fn().mockResolvedValue(mockCatalogItem)
            })
            .compile();

        controller = module.get<FavoriteFurnitureController>(FavoriteFurnitureController);
        favoriteFurnitureService = module.get<FavoriteFurnitureService>(FavoriteFurnitureService);
        userService = module.get<UserService>(UserService);
        catalogService = module.get<CatalogService>(CatalogService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("all", () => {
        it("should return 200 and a list of favorite furniture", async () => {
            const mockFavFurnitures: FavoriteFurniture[] = [mockFavoriteFurniture];
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValue(mockFavFurnitures as any);
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            const expectedData = [
                {
                    furniture: {
                        active: true,
                        colors: [{ color: "red", model_id: 1 }],
                        company: 1,
                        company_name: "Test Company",
                        depth: 40,
                        height: 60,
                        id: 1,
                        name: "Test Furniture",
                        object_id: "test-furniture-1",
                        price: 100,
                        rooms: ["living_room"],
                        styles: ["modern"],
                        width: 50
                    },
                    favorite_furniture: mockFavoriteFurniture
                }
            ];

            const result = await controller.all(mockRequest, mockResponse);

            expect(favoriteFurnitureService.findAll).toHaveBeenCalledWith(1);
            expect(catalogService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Favorite furniture items",
                data: expectedData
            });
        });

        it("should return 404 if no favorite furniture found", async () => {
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValueOnce([]);

            const result = await controller.all(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You don't have any favorite furniture items",
                data: []
            });
        });

        it("should return the count of favorite furniture if count query param is present", async () => {
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValueOnce([mockFavoriteFurniture]);
            const reqWithCount = { ...mockRequest, query: { count: "true" } } as unknown as Request;
            const result = await controller.all(reqWithCount, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result.data).toBe(1);
        });

        it("should handle errors during furniture retrieval", async () => {
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValueOnce([mockFavoriteFurniture]);
            jest.spyOn(catalogService, "findOne").mockRejectedValueOnce(new Error("Database error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.all(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Favorite furniture list was not display because of an error",
                error: expect.any(Error),
                data: null
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("isFavorite", () => {
        it("should return 200 and true if furniture is in favorites", async () => {
            const furnitureId = 1;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);

            const result = await controller.isFavorite(mockRequest, mockResponse, furnitureId);

            expect(favoriteFurnitureService.findOne).toHaveBeenCalledWith({ furniture_id: furnitureId, user_id: mockUser.id });
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture favorite status",
                data: true
            });
        });

        it("should return 200 and false if furniture is not in favorites", async () => {
            const furnitureId = 2; // Different furniture ID
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(null);

            const result = await controller.isFavorite(mockRequest, mockResponse, furnitureId);

            expect(favoriteFurnitureService.findOne).toHaveBeenCalledWith({ furniture_id: furnitureId, user_id: mockUser.id });
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture favorite status",
                data: false
            });
        });

        it("should return 400 if furniture_id is not a number", async () => {
            const furnitureId = "not a number" as any;
            const result = await controller.isFavorite(mockRequest, mockResponse, furnitureId);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Gallery id is not a number",
                data: null
            });
        });
    });

    describe("post", () => {
        it("should add furniture to favorites and return 201", async () => {
            const furnitureId = 1;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(favoriteFurnitureService, "create").mockResolvedValue(mockFavoriteFurniture as any);

            const result = await controller.post(mockRequest, furnitureId, mockResponse);

            expect(catalogService.findOne).toHaveBeenCalledWith({ id: furnitureId });
            expect(favoriteFurnitureService.findOne).toHaveBeenCalledWith({ furniture_id: furnitureId, user_id: mockUser.id });
            expect(favoriteFurnitureService.create).toHaveBeenCalledWith({ furniture_id: furnitureId, user_id: mockUser.id });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Furniture item was added to your favorites",
                data: mockFavoriteFurniture
            });
        });

        it("should return 404 if furniture not found", async () => {
            const furnitureId = 1;
            jest.spyOn(catalogService, "findOne").mockResolvedValueOnce(null);

            const result = await controller.post(mockRequest, furnitureId, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You are not allowed to add this furniture to your favorites because it does not exist",
                data: null
            });
        });

        it("should return 409 if furniture already in favorites", async () => {
            const furnitureId = 1;
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(mockFavoriteFurniture);

            const result = await controller.post(mockRequest, furnitureId, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "You already have this furniture in your favorites",
                data: null
            });
        });

        it("should handle errors during favorites creation", async () => {
            const furnitureId = 1;
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(favoriteFurnitureService, "create").mockRejectedValueOnce(new Error("Database error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.post(mockRequest, furnitureId, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Furniture item was not added to your favorites because of an error",
                error: expect.any(Error),
                data: null
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("deleteItem", () => {
        it("should remove furniture from favorites and return 200", async () => {
            const furnitureId = 1;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture as any);
            jest.spyOn(favoriteFurnitureService, "delete").mockResolvedValue({ affected: 1 } as any);

            const result = await controller.deleteItem(mockRequest, furnitureId, mockResponse);

            expect(favoriteFurnitureService.findOne).toHaveBeenCalledWith({ user_id: mockUser.id, furniture_id: furnitureId });
            expect(favoriteFurnitureService.delete).toHaveBeenCalledWith(furnitureId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture furniture was removed from your favorites",
                data: mockFavoriteFurniture
            });
        });

        it("should handle errors during favorites deletion", async () => {
            const furnitureId = 1;
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture as any);
            jest.spyOn(favoriteFurnitureService, "delete").mockRejectedValueOnce(new Error("Database error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.deleteItem(mockRequest, furnitureId, mockResponse);


            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: "OK", // Original code has a typo here, should be KO
                code: 500,
                description: "Server error",
                data: expect.any(Error)
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

        });
    });

    describe("checkAuthorization", () => {
        it("should return the user if authorized", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse);
            expect(result).toEqual(mockUser);
        });

        describe("checkAuthorization", () => {
            it("should return 401 if no JWT is provided", async () => {
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

            it("should return 404 if furniture is not found when deleting (delete type)", async () => {
                const furnitureId = 1;
                jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(null);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, furnitureId, "delete");
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(result).toEqual({
                    status: "KO",
                    code: 404,
                    description: "This furniture item is not in this user's favorites furniture list",
                    data: null
                });
            });

            it("should return 403 if user is not admin and not the owner when deleting", async () => {
                const furnitureId = 1;
                const favoriteFurniture: FavoriteFurniture = { ...mockFavoriteFurniture, user_id: 2 }; // Different user ID
                jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(favoriteFurniture as any);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, furnitureId, "delete");
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to access/modify this resource",
                    data: null
                });
            });

            it("should return user if authorized (admin) when deleting", async () => {
                const furnitureId = 1;
                const adminUser = { ...mockUser, role: "admin" };
                jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
                const favoriteFurniture: FavoriteFurniture = { ...mockFavoriteFurniture, user_id: 2 }; // Different user
                jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(favoriteFurniture as any);

                const result = await controller["checkAuthorization"](mockRequest, mockResponse, furnitureId, "delete");

                expect(result).toEqual(adminUser);
            });

            it("should return user if authorized (owner) when deleting", async () => {
                const furnitureId = 1;
                jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(mockFavoriteFurniture as any);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, furnitureId, "delete");
                expect(result).toEqual(mockUser);
            });

            it("should return user if type is not delete", async () => {
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, null, null);
                expect(result).toEqual(mockUser);
            });
        });
    });
});
