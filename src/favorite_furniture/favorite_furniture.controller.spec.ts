import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteFurnitureController } from "./favorite_furniture.controller";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { CatalogService } from "../catalog/catalog.service";
import { User } from "../user/models/user.entity";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { Catalog } from "../catalog/models/catalog.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CatalogColors } from "../catalog/models/catalog_colors.entity";
import { CatalogStyles } from "../catalog/models/catalog_styles.entity";
import { CatalogRooms } from "../catalog/models/catalog_rooms.entity";
import { ArchiveService } from "../archive/archive.service";

describe("FavoriteFurnitureController", () => {
    let controller: FavoriteFurnitureController;
    let favoriteFurnitureService: FavoriteFurnitureService;
    let userService: UserService;
    let catalogService: CatalogService;
    let archiveService: ArchiveService;

    const req = { cookies: { jwt: "token" } } as any;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockUserData: User = {
        blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
        cart: undefined,
        checkEmailSent: undefined,
        checkEmailToken: "",
        city: "",
        company_api_key: "",
        deleted: false,
        email: "",
        feedbacks: [],
        first_name: "",
        galleries: [],
        galleryComments: [],
        galleryReports: [],
        hasCheckedEmail: false,
        last_name: "",
        password: "",
        phone: "",
        profile_picture_id: 0,
        role: "",
        settings: undefined,
        id: 1
    };
    const mockUser: User = new User();
    Object.assign(mockUser, mockUserData);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FavoriteFurnitureController],
            providers: [
                FavoriteFurnitureService,
                UserService,
                CatalogService,
                ArchiveService,
                {
                    provide: getRepositoryToken(FavoriteFurniture),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(Catalog),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogColors),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogStyles),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogRooms),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue("token"),
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockResolvedValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        controller = module.get<FavoriteFurnitureController>(FavoriteFurnitureController);
        favoriteFurnitureService = module.get<FavoriteFurnitureService>(FavoriteFurnitureService);
        userService = module.get<UserService>(UserService);
        catalogService = module.get<CatalogService>(CatalogService);
        archiveService = module.get<ArchiveService>(ArchiveService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("all", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await controller.all(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await controller.all(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if user has no favorite furniture", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValue([]);
            const result = await controller.all(req, res);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You don't have any favorite furniture items",
                data: []
            });
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("should return 200 and favorite furniture items", async () => {
            const mockFavoriteFurniture = [
                { id: 1, user_id: 1, furniture_id: 1 },
                { id: 2, user_id: 1, furniture_id: 2 }
            ] as FavoriteFurniture[];
            const mockCatalogItems = [
                {
                    id: 1,
                    active: true,
                    archived: false,
                    object_id: "ddd",
                    name: "Furniture 1",
                    price: 100,
                    styles: [{ style: "modern" } as any],
                    colors: [{ color: "red", model_id: 1 } as any],
                    rooms: [{ room: "living_room" } as any],
                    height: 10,
                    width: 20,
                    depth: 30,
                    company_name: "Company 1",
                    company: 1,
                    favorites: []
                },
                {
                    id: 2,
                    active: true,
                    archived: false,
                    object_id: "ddddddd",
                    name: "Furniture 2",
                    price: 200,
                    styles: [{ style: "classic" } as any],
                    colors: [{ color: "blue", model_id: 2 } as any],
                    rooms: [{ room: "bedroom" } as any],
                    height: 15,
                    width: 25,
                    depth: 35,
                    company_name: "Company 2",
                    company: 2,
                    favorites: []
                }
            ] as Catalog[];

            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findAll").mockResolvedValue(mockFavoriteFurniture);
            jest.spyOn(catalogService, "findOne").mockResolvedValueOnce(mockCatalogItems[0]).mockResolvedValueOnce(mockCatalogItems[1]);

            const result = await controller.all(req, res);

            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Favorite furniture items",
                data: [
                    {
                        furniture: {
                            id: 1,
                            active: true,
                            name: "Furniture 1",
                            price: 100,
                            styles: ["modern"],
                            colors: [{ color: "red", model_id: 1 }],
                            rooms: ["living_room"],
                            height: 10,
                            width: 20,
                            depth: 30,
                            company: "Company 1"
                        },
                        favorite_furniture: mockFavoriteFurniture[0]
                    },
                    {
                        furniture: {
                            id: 2,
                            active: true,
                            name: "Furniture 2",
                            price: 200,
                            styles: ["classic"],
                            colors: [{ color: "blue", model_id: 2 }],
                            rooms: ["bedroom"],
                            height: 15,
                            width: 25,
                            depth: 35,
                            company: "Company 2"
                        },
                        favorite_furniture: mockFavoriteFurniture[1]
                    }
                ]
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("post", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await controller.post(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await controller.post(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if furniture does not exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(catalogService, "findOne").mockResolvedValue(null);
            const result = await controller.post(req, 25, res);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You are not allowed to add this furniture to your favorites because it does not exist",
                data: null
            });
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("should return 409 if furniture is already in favorites", async () => {
            const mockFurniture = { id: 1 } as Catalog;
            const mockFavoriteFurniture = { id: 1 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(catalogService, "findOne").mockResolvedValue(mockFurniture);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller.post(req, 25, res);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "You already have this furniture in your favorites",
                data: null
            });
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it("should add furniture to favorites and return 201", async () => {
            const mockFurniture = { id: 1 } as Catalog;
            const mockFavoriteFurniture = { id: 1, user_id: 1, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(catalogService, "findOne").mockResolvedValueOnce(mockFurniture);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(favoriteFurnitureService, "create").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller.post(req, 25, res);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Furniture item was added to your favorites",
                data: mockFavoriteFurniture
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe("deleteItem", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await controller.deleteItem(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await controller.deleteItem(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if furniture is not in favorites", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(null);
            const result = await controller.deleteItem(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This furniture item is not in this user's favorites furniture list",
                data: null
            });
        });

        it("should return 403 if user is not admin and not the owner", async () => {
            const mockFavoriteFurniture = { id: 1, user_id: 2, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller.deleteItem(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should delete furniture from favorites and return 200", async () => {
            const localMockUserData: User = { ...mockUser, role: "admin" } as User;
            const localMockUser: User = new User();
            Object.assign(localMockUser, localMockUserData);
            const mockFavoriteFurniture = { id: 1, user_id: 2, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(localMockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            jest.spyOn(favoriteFurnitureService, "delete").mockResolvedValue({ affected: 1 });
            const result = await controller.deleteItem(req, 25, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture furniture was removed from your favorites",
                data: mockFavoriteFurniture
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await controller["checkAuthorization"](req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await controller["checkAuthorization"](req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user if type is not delete", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await controller["checkAuthorization"](req, res);
            expect(result).toEqual(mockUser);
        });

        it("should return 404 if furniture is not found in favorites (delete)", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(null);
            const result = await controller["checkAuthorization"](req, res, 25, "delete");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This furniture item is not in this user's favorites furniture list",
                data: null
            });
        });

        it("should return 403 if user is not admin and not the owner (delete)", async () => {
            const mockFavoriteFurniture = { id: 1, user_id: 2, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller["checkAuthorization"](req, res, 25, "delete");
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user if user is admin (delete)", async () => {
            const localMockUser = { ...mockUser, role: "admin" } as User;
            const mockFavoriteFurniture = { id: 1, user_id: 2, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(localMockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller["checkAuthorization"](req, res, 25, "delete");
            expect(result).toEqual(localMockUser);
        });

        it("should return user if user is the owner (delete)", async () => {
            const mockFavoriteFurniture = { id: 1, user_id: 1, furniture_id: 25 } as FavoriteFurniture;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(favoriteFurnitureService, "findOne").mockResolvedValue(mockFavoriteFurniture);
            const result = await controller["checkAuthorization"](req, res, 25, "delete");
            expect(result).toEqual(mockUser);
        });
    });
});
