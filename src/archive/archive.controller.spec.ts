import { Test, TestingModule } from "@nestjs/testing";
import { ArchiveController } from "./archive.controller";
import { ArchiveService } from "./archive.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import { Catalog } from "../catalog/models/catalog.entity";
import { CatalogResponseDto } from "../catalog/dtos/catalog-response.dto";
import { UserSettings } from "../user_settings/models/user_settings.entity";


describe("ArchiveController", () => {
    let controller: ArchiveController;
    let archiveService: ArchiveService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "hashedPassword",
        role: "company", // Set default role to 'company'
        settings: { display_lastname_on_public: true } as UserSettings,
        galleries: [], galleryLikes: [], galleryComments: [], galleryReports: [],
        feedbacks: [], blocking: [], blocked_by: [], favorite_galleries: [],
        favorite_furniture: [], profile_picture_id: 0, checkEmailToken: null,
        checkEmailSent: null, hasCheckedEmail: false, deleted: false, city: null,
        phone: null, company_api_key: "mockApiKey", cart: null
    };

    const mockCatalogItem: Catalog = {
        id: 1,
        name: "Test Furniture",
        price: 100,
        width: 50, height: 60, depth: 40,
        styles: [{
            id: 1, style: "modern",
            furniture: new Catalog,
            furniture_id: 0
        }],
        rooms: [{
            id: 1, room: "living_room",
            furniture: new Catalog,
            furniture_id: 0
        }],
        colors: [{
            id: 1, color: "red", model_id: 0,
            furniture: new Catalog,
            furniture_id: 0
        }],
        object_id: "test-furniture-1", active: true, archived: true,
        company: 1, company_name: "Test Company", favorites: []
    };

    const mockCatalogResponseDto: CatalogResponseDto = {
        id: 1,
        name: "Test Furniture",
        price: 100,
        width: 50, height: 60, depth: 40,
        styles: ["modern"],
        rooms: ["living_room"],
        colors: [{ color: "red", model_id: 0 }],
        object_id: "test-furniture-1", active: true,
        company: 1, company_name: "Test Company"
    };


    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        query: { company_api_key: "mockApiKey" }
    } as unknown as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArchiveController],
            providers: [
                {
                    provide: ArchiveService,
                    useValue: {
                        findAllForCompany: jest.fn(),
                        findById: jest.fn(),
                        deleteObjectForCompany: jest.fn(),
                        deleteAllForCompany: jest.fn(),
                        restore: jest.fn()
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
                }
            ]
        }).compile();

        controller = module.get<ArchiveController>(ArchiveController);
        archiveService = module.get<ArchiveService>(ArchiveService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("get", () => {
        it("should return archived objects for a company", async () => {
            const companyId = 1;
            const mockArchivedObjects: CatalogResponseDto[] = [mockCatalogResponseDto];
            jest.spyOn(archiveService, "findAllForCompany").mockResolvedValueOnce(mockArchivedObjects as any);

            const result = await controller.get(mockRequest, companyId, mockResponse);

            expect(archiveService.findAllForCompany).toHaveBeenCalledWith(companyId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Objects list",
                data: mockArchivedObjects
            });
        });

        it("should handle errors when retrieving archived objects", async () => {
            const companyId = 1;
            jest.spyOn(archiveService, "findAllForCompany").mockResolvedValueOnce(null); // Simulate error
            const result = await controller.get(mockRequest, companyId, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Objects not found",
                data: null
            });
        });
    });

    describe("remove", () => {
        it("should remove a specific object from the archive", async () => {
            const companyId = 1;
            const itemId = 1;
            jest.spyOn(archiveService, "findById").mockResolvedValueOnce(mockCatalogItem as any);
            jest.spyOn(archiveService, "deleteObjectForCompany").mockResolvedValue(mockCatalogResponseDto as any);
            const result = await controller.remove(mockRequest, companyId, itemId, mockResponse);
            expect(archiveService.deleteObjectForCompany).toHaveBeenCalledWith(companyId, itemId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Object removed",
                data: mockCatalogResponseDto
            });
        });

        it("should handle not found error when removing object", async () => {
            const companyId = 1;
            const itemId = 1;
            jest.spyOn(archiveService, "findById").mockResolvedValueOnce(mockCatalogItem as any);
            jest.spyOn(archiveService, "deleteObjectForCompany").mockResolvedValueOnce(null);
            const result = await controller.remove(mockRequest, companyId, itemId, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Object not removed",
                data: null
            });
        });
    });

    describe("removeAll", () => {
        it("should remove all archived objects for a company", async () => {
            const companyId = 1;
            const mockArchivedObjects: CatalogResponseDto[] = [mockCatalogResponseDto];
            jest.spyOn(archiveService, "deleteAllForCompany").mockResolvedValueOnce(mockArchivedObjects as any);

            const result = await controller.removeAll(mockRequest, companyId, mockResponse);

            expect(archiveService.deleteAllForCompany).toHaveBeenCalledWith(companyId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Objects removed",
                data: mockArchivedObjects
            });
        });

        // ... (tests for authentication, authorization, and error handling)
    });

    describe("restore", () => {
        it("should restore an archived object", async () => {
            const companyId = 1;
            const itemId = 1;
            jest.spyOn(archiveService, "restore").mockResolvedValue(mockCatalogResponseDto as any);
            jest.spyOn(archiveService, "findById").mockResolvedValueOnce(mockCatalogItem as any);
            const result = await controller.restore(mockRequest, companyId, itemId, mockResponse);

            expect(archiveService.restore).toHaveBeenCalledWith(mockCatalogItem);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Object restored",
                data: mockCatalogResponseDto
            });
        });

        it("should handle not found error when restoring object", async () => {
            const companyId = 1;
            const itemId = 1;
            jest.spyOn(archiveService, "findById").mockResolvedValueOnce(mockCatalogItem as any);
            jest.spyOn(archiveService, "restore").mockResolvedValueOnce(null);
            const result = await controller.restore(mockRequest, companyId, itemId, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Object not restored",
                data: null
            });
        });
    });


    describe("checkAuthorization", () => {
        it("should return user and object if authorized", async () => {
            const companyId = 1;
            const itemId = 1;
            mockUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValueOnce({ ...mockUser, role: "admin" } as any);
            jest.spyOn(archiveService, "findById").mockResolvedValueOnce(mockCatalogItem as any);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, companyId, itemId);
            expect(result).toEqual([mockUser, mockCatalogItem]);
        });

        // ... tests for authentication, authorization (different roles, invalid API key), not found, and error handling
    });
});
