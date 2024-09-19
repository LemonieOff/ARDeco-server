import { Test, TestingModule } from "@nestjs/testing";
import { ChangelogController } from "./changelog.controller";
import { ChangelogService } from "./changelog.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/models/user.entity";
import { Changelog } from "./models/changelog.entity";
import { HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { ChangelogDto } from "./models/changelog.dto";

describe("ChangelogController", () => {
    let controller: ChangelogController;
    let changelogService: ChangelogService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = new User();
    mockUser.id = 1;

    const mockChangelog = new Changelog();
    mockChangelog.id = 1;
    mockChangelog.version = "1.0.0";

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChangelogController],
            providers: [
                {
                    provide: ChangelogService,
                    useValue: {
                        latest: jest.fn(),
                        all: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
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
                }
            ]
        }).compile();

        controller = module.get<ChangelogController>(ChangelogController);
        changelogService = module.get<ChangelogService>(ChangelogService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getLatestChangelog", () => {
        it("should return the latest changelog entry", async () => {
            jest.spyOn(changelogService, "latest").mockResolvedValue(mockChangelog);
            await controller.getLatestChangelog(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                code: HttpStatus.OK,
                description: "Latest changelog version",
                data: mockChangelog,
            });
        });

        it("should handle the case where there is no latest changelog entry", async () => {
            jest.spyOn(changelogService, "latest").mockResolvedValue(null);
            await controller.getLatestChangelog(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                code: HttpStatus.OK,
                description: "Latest changelog version",
                data: null,
            });
        });
    });

    describe("all", () => {
        it("should return all changelog entries", async () => {
            const mockChangelogEntries = [mockChangelog, { ...mockChangelog, id: 2 }];
            jest.spyOn(changelogService, "all").mockResolvedValue(mockChangelogEntries as any);
            await controller.all(mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                code: HttpStatus.OK,
                description: "Full changelog",
                data: mockChangelogEntries,
            });
        });
    });

    describe("create", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const data: ChangelogDto = { version: "1.1.0", changelog: "Test", name: "Test" };
            const result = await controller.create(data, req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            });
        });

        it("should return 401 if user is not found", async () => {
            const data: ChangelogDto = { version: "1.1.0", changelog: "Test", name: "Test" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.create(data, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            });
        });

        it("should return 403 if user is not admin", async () => {
            const data: ChangelogDto = { version: "1.1.0", changelog: "Test", name: "Test" };
            const user = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            const result = await controller.create(data, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not allowed to create a new version into the changelog",
                data: null,
            });
        });

        it("should create a new changelog entry", async () => {
            const data: ChangelogDto = { version: "1.1.0", changelog: "Test", name: "Test" };
            const user = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            jest.spyOn(changelogService, "create").mockResolvedValue(mockChangelog as any);
            const result = await controller.create(data, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Changelog was created",
                data: mockChangelog,
            });
        });
    });

    describe("get", () => {
        it("should return the changelog entry with the given ID", async () => {
            jest.spyOn(changelogService, "findOne").mockResolvedValue(mockChangelog as any);
            await controller.get(1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                code: HttpStatus.OK,
                description: `Changelog ${mockChangelog.id} details`,
                data: mockChangelog,
            });
        });

        it("should return 404 if changelog entry is not found", async () => {
            jest.spyOn(changelogService, "findOne").mockResolvedValue(null);
            await controller.get(1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "KO",
                code: 404,
                description: "Changelog not found",
                data: null,
            });
        });
    });

    describe("update", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.update(1, {}, req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            });
        });

        it("should return 401 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.update(1, {}, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null,
            });
        });

        it("should return 403 if user is not admin", async () => {
            const user = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            const result = await controller.update(1, {}, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to update a version in the changelog",
                data: null,
            });
        });

        it("should return 404 if changelog entry is not found", async () => {
            const user = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            jest.spyOn(changelogService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.update(1, {}, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "KO",
                code: 404,
                description: "Changelog not found",
                data: null,
            });
        });

        it("should update the changelog entry with the given ID", async () => {
            const user = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            jest.spyOn(changelogService, "findOne").mockResolvedValueOnce(mockChangelog as any);
            jest.spyOn(changelogService, "update").mockResolvedValue(mockChangelog as any);
            await controller.update(1, { version: "1.1.0" }, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "OK",
                code: HttpStatus.OK,
                description: `Changelog ${mockChangelog.id} updated`,
                data: mockChangelog,
            });
        });
    });

    describe("delete", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.delete(1, req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "Vous n'êtes pas connecté",
                data: null,
            });
        });

        it("should return 401 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.delete(1, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "Vous n'êtes pas connecté",
                data: null,
            });
        });

        it("should return 403 if user is not admin", async () => {
            const user = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            const result = await controller.delete(1, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "Vous n'êtes pas autorisé à supprimer une version du changelog",
                data: null,
            });
        });

        it("should return 404 if changelog entry is not found", async () => {
            const user = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            jest.spyOn(changelogService, "delete").mockResolvedValue({ affected: 0 } as any);
            const result = await controller.delete(1, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.NOT_FOUND,
                description: "Changelog non trouvé",
                data: null,
            });
        });

        it("should delete the changelog entry with the given ID", async () => {
            const user = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            jest.spyOn(changelogService, "delete").mockResolvedValue({ affected: 1 } as any);
            const result = await controller.delete(1, mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: `Changelog 1 supprimé`,
                data: null,
            });
        });
    });
});
