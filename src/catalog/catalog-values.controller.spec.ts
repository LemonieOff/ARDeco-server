import { Test, TestingModule } from "@nestjs/testing";
import { CatalogValuesController } from "./catalog-values.controller";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import * as FurnitureValues from "./values";

describe("CatalogValuesController", () => {
    let controller: CatalogValuesController;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = new User();
    mockUser.id = 1;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CatalogValuesController],
            providers: [
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

        controller = module.get<CatalogValuesController>(CatalogValuesController);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("allValues", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.allValues(request, mockResponse);
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
            const result = await controller.allValues(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 200 and all furniture values", async () => {
            const result = await controller.allValues(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture available values",
                data: {
                    colors: FurnitureValues.colors,
                    rooms: FurnitureValues.rooms,
                    styles: FurnitureValues.styles
                }
            });
        });
    });

    describe("getColors", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.getColors(request, mockResponse);
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
            const result = await controller.getColors(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 200 and available furniture colors", async () => {
            const result = await controller.getColors(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture available colors",
                data: FurnitureValues.colors
            });
        });
    });

    describe("getStyles", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.getStyles(request, mockResponse);
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
            const result = await controller.getStyles(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 200 and available furniture styles", async () => {
            const result = await controller.getStyles(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture available styles",
                data: FurnitureValues.styles
            });
        });
    });

    describe("getRooms", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.getRooms(request, mockResponse);
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
            const result = await controller.getRooms(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 200 and available furniture rooms", async () => {
            const result = await controller.getRooms(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Furniture available rooms",
                data: FurnitureValues.rooms
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.checkAuthorization(request, mockResponse);
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
            const result = await controller.checkAuthorization(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user if authorized", async () => {
            const result = await controller.checkAuthorization(mockRequest, mockResponse);
            expect(result).toEqual(mockUser);
        });
    });
});
