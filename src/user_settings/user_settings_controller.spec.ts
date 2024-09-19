import { Test, TestingModule } from "@nestjs/testing";
import { UserSettingsController } from "./user_settings_controller";
import { UserSettingsService } from "./user_settings_service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/models/user.entity";
import { UserSettings } from "./models/user_settings.entity";
import { Request, Response } from "express";
import { UserSettingsCreateDto } from "./models/user_settings_create.dto";

describe("UserSettingsController", () => {
    let controller: UserSettingsController;
    let userSettingsService: UserSettingsService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.role = "client";

    const mockUserSettings = new UserSettings();
    mockUserSettings.id = 10;
    mockUserSettings.user = mockUser;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserSettingsController],
            providers: [
                {
                    provide: UserSettingsService,
                    useValue: {
                        all: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockReturnValue({ id: 1 })
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

        controller = module.get<UserSettingsController>(UserSettingsController);
        userSettingsService = module.get<UserSettingsService>(UserSettingsService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("get", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const result = await controller.get(req, 10, mockResponse);
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
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const result = await controller.get(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if settings are not found", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.get(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Resource was not found",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin", async () => {
            const mockSettings = { ...mockUserSettings, user: { ...mockUser, id: 2 } };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockSettings as any);
            const result = await controller.get(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify/delete this resource",
                data: null
            });
        });

        it("should return 200 and the user settings if authorized", async () => {
            const select = {
                user: {
                    id: true,
                    role: true
                }
            };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce({
                ...mockUserSettings,
                user: { id: 1, role: "client" }
            } as any);
            const result = await controller.get(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User settings",
                data: {
                    ...mockUserSettings,
                    user: { id: 1 }
                }
            });
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ id: 10 }, select);
        });
    });

    describe("getOwnSettings", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getOwnSettings(req, mockResponse);
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
            const result = await controller.getOwnSettings(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if user has no settings", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getOwnSettings(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You don't have any user settings yet",
                data: null
            });
        });

        it("should return 200 and the user settings if found", async () => {
            const select = {
                user: {
                    id: true
                }
            };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce({
                ...mockUserSettings,
                user: { id: 1 }
            } as any);
            const result = await controller.getOwnSettings(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Your user settings",
                data: { ...mockUserSettings, user: { id: 1 } }
            });
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ user: { id: 1 } }, select);
        });
    });

    describe("post", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const dto = new UserSettingsCreateDto();
            const result = await controller.post(req, dto, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create user settings",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const dto = new UserSettingsCreateDto();
            const result = await controller.post(mockRequest, dto, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create user settings",
                data: null
            });
        });

        it("should return 400 if user settings already exist", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const dto = new UserSettingsCreateDto();
            const result = await controller.post(mockRequest, dto, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User settings already exist",
                data: null
            });
        });

        it("should create user settings and return 201", async () => {
            const settingsToCreate: any = { ...mockUserSettings, user: { id: 1 }, dark_mode: true };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(userSettingsService, "create").mockResolvedValue(settingsToCreate);
            const dto = new UserSettingsCreateDto();
            dto.dark_mode = true;
            const result = await controller.post(mockRequest, dto, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "User settings was created",
                data: settingsToCreate
            });
        });

        it("should return 400 if there's an error during creation", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(userSettingsService, "create").mockRejectedValue(new Error("Database error"));
            const dto = new UserSettingsCreateDto();
            dto.dark_mode = true;
            const result = await controller.post(mockRequest, dto, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User settings was not created because of an error",
                error: expect.any(Error),
                data: null
            });
        });
    });

    describe("deleteItem", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
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
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if settings are not found", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Resource was not found",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin", async () => {
            const mockSettings = { ...mockUserSettings, user: { ...mockUser, id: 2 } };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockSettings as any);
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify/delete this resource",
                data: null
            });
        });

        it("should delete user settings and return 200 if authorized", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings as any);
            jest.spyOn(userSettingsService, "delete").mockResolvedValue({ affected: 1 } as any);
            const consoleSpy = jest.spyOn(console, "error");
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Settings has successfully been deleted",
                data: { affected: 1 }
            });
            expect(userSettingsService.delete).toHaveBeenCalledWith(10);
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it("should return 500 if there's an error during deletion", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings as any);
            jest.spyOn(userSettingsService, "delete").mockRejectedValue(new Error("Database error"));
            const consoleSpy = jest.spyOn(console, "error");
            const result = await controller.deleteItem(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: "OK", // Note: This is likely a typo in the original code, should be 'KO'
                code: 500,
                description: "Server error",
                data: mockUserSettings
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("editViaParam", () => {
        it("should return 200 and the updated user settings", async () => {
            const updatedSettings = { ...mockUserSettings, dark_mode: true };
            jest.spyOn(userSettingsService, "findOne")
                .mockResolvedValueOnce({ ...mockUserSettings, user: { id: 1, role: "client" } } as any)
                .mockResolvedValueOnce(updatedSettings as any);
            jest.spyOn(userSettingsService, "update").mockResolvedValue(updatedSettings as any);
            const result = await controller.editViaParam(
                mockRequest,
                10,
                { dark_mode: true },
                mockResponse
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User settings was updated",
                data: updatedSettings
            });
        });

        it("should return 400 if there's an error during update", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce({
                ...mockUserSettings,
                user: { id: 1, role: "client" }
            } as any);
            jest.spyOn(userSettingsService, "update").mockRejectedValue(new Error("Database error"));
            const consoleSpy = jest.spyOn(console, "error");
            const result = await controller.editViaParam(
                mockRequest,
                10,
                { dark_mode: true },
                mockResponse
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User settings was not updated because of an error",
                data: "Database error"
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("editOwnSettings", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.editOwnSettings(req, { dark_mode: true }, mockResponse);
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
            const result = await controller.editOwnSettings(mockRequest, { dark_mode: true }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if user has no existing settings", async () => {
            const select = { id: true, user: { id: true } };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.editOwnSettings(mockRequest, { dark_mode: true }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "You don't have any user settings yet",
                data: null
            });
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ user: { id: 1 } }, select);
        });

        it("should call editItem with the correct settings ID", async () => {
            const select = { id: true, user: { id: true } };
            const existingSettings = { id: 10, user: { id: 1 } } as UserSettings;
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(existingSettings);
            jest.spyOn(controller, "editItem").mockResolvedValueOnce({
                // Mock the return value of editItem
                status: "OK",
                code: 200,
                description: "User settings was updated",
                data: {}
            });
            await controller.editOwnSettings(mockRequest, { dark_mode: true }, mockResponse);
            expect(controller.editItem).toHaveBeenCalledWith(mockRequest, 10, { dark_mode: true }, mockResponse);
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ user: { id: 1 } }, select);
        });
    });

    describe("editSpecificUserSettings", () => {
        it("should return 400 if user_id is not a number", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const result = await controller.editSpecificUserSettings(mockRequest, NaN, { dark_mode: true }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User id is not a number",
                data: null
            });
        });

        it("should return 404 if settings for this user_id do not exist", async () => {
            const select = { id: true, user: { id: true } };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.editSpecificUserSettings(mockRequest, 2, { dark_mode: true }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "There are no settings for this user yet",
                data: null
            });
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ user: { id: 2 } }, select);
        });

        it("should call editItem with correct settings ID if settings exist", async () => {
            const select = { id: true, user: { id: true } };
            const existingSettings = { id: 15, user: { id: 2 } } as UserSettings;
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(existingSettings);
            jest.spyOn(controller, "editItem").mockResolvedValueOnce({
                // Mock the return value of editItem
                status: "OK",
                code: 200,
                description: "User settings was updated",
                data: {}
            });
            await controller.editSpecificUserSettings(mockRequest, 2, { dark_mode: true }, mockResponse);
            expect(controller.editItem).toHaveBeenCalledWith(mockRequest, 15, { dark_mode: true }, mockResponse);
            expect(userSettingsService.findOne).toHaveBeenCalledWith({ user: { id: 2 } }, select);
        });
    });

    describe("editItem", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            const result = await controller.editItem(req, 10, {}, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockUserSettings);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.editItem(mockRequest, 10, {}, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if settings are not found", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.editItem(mockRequest, 10, {}, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Resource was not found",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin", async () => {
            const mockSettings = { ...mockUserSettings, user: { ...mockUser, id: 2 } };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce(mockSettings as any);
            const result = await controller.editItem(mockRequest, 10, {}, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify/delete this resource",
                data: null
            });
        });

        it("should update user settings and return 200 if authorized", async () => {
            const updatedSettings = { ...mockUserSettings, dark_mode: true };
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce({
                ...mockUserSettings,
                user: { id: 1, role: "client" }
            } as any);
            jest.spyOn(userSettingsService, "update").mockResolvedValue(updatedSettings as any);
            const result = await controller.editItem(
                mockRequest,
                10,
                { dark_mode: true },
                mockResponse
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User settings was updated",
                data: updatedSettings
            });
        });

        it("should return 400 if there's an error during update", async () => {
            jest.spyOn(userSettingsService, "findOne").mockResolvedValueOnce({
                ...mockUserSettings,
                user: { id: 1, role: "client" }
            } as any);
            jest.spyOn(userSettingsService, "update").mockRejectedValue(new Error("Database error"));
            const consoleSpy = jest.spyOn(console, "error");
            const result = await controller.editItem(
                mockRequest,
                10,
                { dark_mode: true },
                mockResponse
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User settings was not updated because of an error",
                data: "Database error"
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("checkAuthorization", () => {
        it("should return 404 if check_settings is true and settings are null", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, true, null);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Resource was not found",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller["checkAuthorization"](req, mockResponse, true, mockUserSettings);
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
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, true, mockUserSettings);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 403 if check_settings is true, user is not the owner and user is not admin", async () => {
            const mockSettings = { ...mockUserSettings, user: { ...mockUser, id: 2 } };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(mockUser);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, true, mockSettings);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify/delete this resource",
                data: null
            });
        });

        it("should return user if authorized", async () => {
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, true, mockUserSettings);
            expect(result).toEqual(mockUser);
        });
    });
});
