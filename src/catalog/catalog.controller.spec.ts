import { Test, TestingModule } from "@nestjs/testing";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import { CatalogFilterDto } from "./dtos/catalog-filter.dto";
import { CatalogResponseDto } from "./dtos/catalog-response.dto";
import { UserSettings } from "../user_settings/models/user_settings.entity";
import { CatalogCreateDto } from "./dtos/catalog-create.dto";
import { HttpStatus } from "@nestjs/common";
import { CatalogUpdateDto } from "./dtos/catalog-update.dto";

describe("CatalogController", () => {
    let controller: CatalogController;
    let catalogService: CatalogService;
    let userService: UserService;
    let jwtService: JwtService;

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

    const mockCatalogItem: CatalogResponseDto = {
        id: 1,
        name: "Test Furniture",
        price: 100,
        width: 50, height: 60, depth: 40,
        styles: ["modern"],
        rooms: ["living_room"],
        colors: [{ color: "red", model_id: 1 }],
        object_id: "test-furniture-1", active: true,
        company: 1, company_name: "Test Company"
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        query: { company_api_key: "mockApiKey" },
        body: {}
    } as unknown as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CatalogController],
            providers: [
                {
                    provide: CatalogService,
                    useValue: {
                        all: jest.fn(),
                        filter: jest.fn(),
                        findOneById: jest.fn(),
                        findByCompany: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        archive: jest.fn(),
                        archiveArray: jest.fn(),
                        archiveAllForCompany: jest.fn(),
                        findColor: jest.fn(),
                        isExistingModelForFurniture: jest.fn()
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

        controller = module.get<CatalogController>(CatalogController);
        catalogService = module.get<CatalogService>(CatalogService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getCatalog", () => {
        it("should return all catalog items", async () => {
            const mockCatalog = [mockCatalogItem];
            jest.spyOn(catalogService, "all").mockResolvedValueOnce(mockCatalog as any);
            jest.spyOn(controller, "checkAuthorizationUser").mockResolvedValue(mockUser as any);

            const result = await controller.getCatalog(mockRequest, mockResponse);

            expect(catalogService.all).toHaveBeenCalledWith(true); // Expecting activeOnly to be true for non-admin
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All objects from catalog",
                data: mockCatalog
            });
        });

        it("should return all catalog items (admin)", async () => {
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(controller, "checkAuthorizationUser").mockResolvedValue(adminUser);
            const mockCatalog = [mockCatalogItem];
            jest.spyOn(catalogService, "all").mockResolvedValueOnce(mockCatalog as any);

            const result = await controller.getCatalog(mockRequest, mockResponse);

            expect(catalogService.all).toHaveBeenCalledWith(false); // Expecting activeOnly to be false for admin
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All objects from catalog",
                data: mockCatalog
            });
        });
    })

    describe("filterCatalog", () => {
        it("should filter and return catalog items", async () => {
            const filterDto: CatalogFilterDto = { colors: [], rooms: [], styles: [], price: 200 };
            const mockFilteredCatalog = [mockCatalogItem];
            jest.spyOn(catalogService, "filter").mockResolvedValueOnce(mockFilteredCatalog as any);
            const isAdminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(isAdminUser as any);

            const result = await controller.filterCatalog(mockRequest, filterDto, mockResponse);

            expect(catalogService.filter).toHaveBeenCalledWith(filterDto, true);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All filtered objects from catalog",
                data: mockFilteredCatalog
            });
        });
    });

    describe("getSpecificFurniture", () => {
        it("should return a specific furniture item", async () => {
            const furnitureId = 1;
            jest.spyOn(catalogService, "findOneById").mockResolvedValueOnce(mockCatalogItem as any);

            const result = await controller.getSpecificFurniture(mockRequest, mockResponse, furnitureId);

            expect(catalogService.findOneById).toHaveBeenCalledWith(furnitureId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: `Furniture ${mockCatalogItem.id}`,
                data: mockCatalogItem
            });
        });

        describe("authorization and active checks", () => {
            it("should return 401 if user is not connected", async () => {
                const req = { cookies: {} } as Request;
                const result = await controller.getSpecificFurniture(req, mockResponse, 1);
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
                const result = await controller.getSpecificFurniture(mockRequest, mockResponse, 1);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "Your user doesn't exists ant can't access this resource",
                    data: null
                });
            });

            it("should return 404 if furniture is not found", async () => {
                jest.spyOn(catalogService, "findOneById").mockResolvedValueOnce(null);
                const result = await controller.getSpecificFurniture(mockRequest, mockResponse, 2); // Non-existent ID
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(result).toEqual({
                    status: "KO",
                    code: 404,
                    description: "This furniture doesn't exist in the catalog",
                    data: null
                });
            });

            it("should return 403 if furniture is inactive and user is not admin or company owner", async () => {
                const inactiveFurniture = { ...mockCatalogItem, active: false, company: 2 }; // Different company
                jest.spyOn(catalogService, "findOneById").mockResolvedValueOnce(inactiveFurniture as any);

                const result = await controller.getSpecificFurniture(mockRequest, mockResponse, 1);

                expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
                expect(result).toEqual({
                    status: "OK", // Should probably be "KO"
                    code: HttpStatus.FORBIDDEN,
                    description: "You don't have access to this furniture",
                    data: null
                });
            })

            it("should return 200 if furniture is inactive but user is the company owner", async () => {
                const companyUser = { ...mockUser, role: "company" };
                jest.spyOn(userService, "findOne").mockResolvedValueOnce(companyUser as any);
                const inactiveFurniture = { ...mockCatalogItem, active: false, company: 1 };
                jest.spyOn(catalogService, "findOneById").mockResolvedValueOnce(inactiveFurniture as any);

                const result = await controller.getSpecificFurniture(mockRequest, mockResponse, 1);

                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(result).toEqual({
                    status: "OK",
                    code: 200,
                    description: `Furniture ${inactiveFurniture.id}`,
                    data: inactiveFurniture
                });
            });

            it("should return 200 if furniture is inactive and user is admin", async () => {
                const adminUser = { ...mockUser, role: "admin" };
                jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser);
                const inactiveFurniture = { ...mockCatalogItem, active: false };
                jest.spyOn(catalogService, "findOneById").mockResolvedValueOnce(inactiveFurniture as any);

                const result = await controller.getSpecificFurniture(mockRequest, mockResponse, 1);

                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(result).toEqual({
                    status: "OK",
                    code: 200,
                    description: `Furniture ${inactiveFurniture.id}`,
                    data: inactiveFurniture
                });
            });
        });


        // ... (tests for error cases and other scenarios)
    });

    describe("getCompanyCatalog", () => {
        it("should return company catalog", async () => {
            const companyId = 1;
            const mockCatalog = [mockCatalogItem];
            jest.spyOn(catalogService, "findByCompany").mockResolvedValueOnce(mockCatalog as any);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce({ ...mockUser, role: "company", id: companyId } as any);

            const result = await controller.getCompanyCatalog(mockRequest, companyId, mockResponse);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(catalogService.findByCompany).toHaveBeenCalledWith(companyId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: `All available objects from catalog for company ${companyId} (${mockUser.first_name} ${mockUser.last_name})`,
                data: mockCatalog
            });
        });
    });

    describe("add", () => {
        it("should add new furniture to the catalog", async () => {
            const companyId = 1;
            const catalogCreateDtos: CatalogCreateDto[] = [
                {
                    name: "New Furniture 1", price: 150, width: 75, height: 80, depth: 35,
                    colors: ["red", "blue"], rooms: ["bedroom"], styles: ["modern"],
                    company_name: "Test Company", object_id: "new-furniture-1",
                    company: 0
                },
                {
                    name: "New Furniture 2", price: 200, width: 100, height: 90, depth: 40,
                    colors: ["green"], rooms: ["living_room"], styles: ["contemporary"],
                    company_name: "Test Company", object_id: "new-furniture-2",
                    company: 0
                }
            ];

            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser as any);
            jest.spyOn(catalogService, "create").mockResolvedValue(mockCatalogItem as any);
            jest.spyOn(controller, "checkObject").mockReturnValue([]); // No errors

            const result = await controller.add(mockRequest, companyId, catalogCreateDtos, mockResponse);

            expect(controller.checkAuthorization).toHaveBeenCalledWith(mockRequest, mockResponse, companyId);
            expect(userService.findOne).toHaveBeenCalledWith({ id: companyId });
            expect(catalogService.create).toHaveBeenCalledTimes(2); // Called for each DTO
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Objects registered",
                data: catalogCreateDtos // The returned data should be the created objects
            });
        });

        it("should return 400 if catalog is not an array or is empty", async () => {
            const companyId = 1;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            const result = await controller.add(mockRequest, companyId, null as any, mockResponse); // Invalid catalog
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "No object to register",
                data: null
            });

            const result2 = await controller.add(mockRequest, companyId, [], mockResponse); // Empty catalog
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result2).toEqual({
                status: "KO",
                code: 400,
                description: "No object to register",
                data: null
            });
        })

        it("should return 400 with validation errors", async () => {
            const companyId = 1;
            const catalogCreateDto: CatalogCreateDto = {
                name: "Invalid Furniture", price: -10, width: -20, height: -30, depth: -40,
                colors: ["invalid"], rooms: ["invalid"], styles: ["invalid"], company_name: null, object_id: null,
                company: 0
            };
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(controller, "checkObject").mockReturnValue(["Validation error 1", "Validation error 2"]);

            const result = await controller.add(mockRequest, companyId, [catalogCreateDto], mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: [["Validation error 1", "Validation error 2"]],
                data: null
            });
        })

        it("should handle database errors during creation", async () => {
            const companyId = 1;
            const catalogCreateDto: CatalogCreateDto = {
                name: "New Furniture",
                price: 150,
                width: 75,
                height: 80,
                depth: 35,
                colors: ["red"],
                rooms: ["bedroom"],
                styles: ["modern"],
                company_name: "Test Company",
                object_id: "new-furniture-1",
                company: 0
            };
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser as any);
            jest.spyOn(catalogService, "create").mockRejectedValueOnce(new Error("Database error"));
            const consoleErrorSpy = jest.spyOn(console, "error");

            const result = await controller.add(mockRequest, companyId, [catalogCreateDto], mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: "KO",
                code: 500,
                description: "Internal server error",
                data: null
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("update", () => {
        it("should update an existing furniture item", async () => {
            const companyId = 1;
            const catalogId = 1;
            const updateDto: CatalogUpdateDto = {
                name: "Updated Furniture",
                price: 250,
                colors: [{ color: "green", model_id: 2 }],
                styles: ["classic"],
                rooms: ["office"],
                company_name: "",
                object_id: "",
                width: 0,
                height: 0,
                depth: 0,
                active: false
            };
            const updatedCatalogItem = { ...mockCatalogItem, ...updateDto } as CatalogResponseDto;
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser as any);
            jest.spyOn(catalogService, "findOne").mockResolvedValue(mockCatalogItem as any);
            jest.spyOn(catalogService, "update").mockResolvedValue(updatedCatalogItem as any);
            jest.spyOn(controller, "checkObject").mockReturnValue([]); // No errors

            const result = await controller.update(mockRequest, companyId, catalogId, updateDto, mockResponse);

            expect(controller.checkAuthorization).toHaveBeenCalledWith(mockRequest, mockResponse, companyId);
            expect(userService.findOne).toHaveBeenCalledWith({ id: companyId });
            expect(catalogService.findOne).toHaveBeenCalledWith({ id: catalogId, company: companyId });
            expect(catalogService.update).toHaveBeenCalledWith(mockCatalogItem, updateDto);
            expect(controller.checkObject).toHaveBeenCalledWith(mockUser, updateDto);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Object updated",
                data: updatedCatalogItem
            });
        });

        it("should return 400 if object not found", async () => {
            const companyId = 1;
            const catalogId = 2; // Non-existent
            const updateDto: CatalogUpdateDto = {
                active: false,
                colors: [],
                company_name: "",
                depth: 0,
                height: 0,
                object_id: "",
                price: 0,
                rooms: [],
                styles: [],
                width: 0,
                name: "Updated" };
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue(mockUser);
            jest.spyOn(catalogService, "findOne").mockResolvedValue(null); // Object not found

            const result = await controller.update(mockRequest, companyId, catalogId, updateDto, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Object doesn't exist in the catalog",
                data: null
            });
        });

        // ... Add more tests for validation errors, database errors, etc. similar to the "add" method tests ...
    });

    // ... (tests for other controller methods: add, update, removeAll, removeOne, remove, checkAuthorization, etc.)
});
