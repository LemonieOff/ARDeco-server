import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "./models/user.entity";
import { MailService } from "../mail/mail.service";

describe("UserController", () => {
    let userController: UserController;
    let userService: UserService;
    let jwtService: JwtService;
    let mailService: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        all: jest.fn(),
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn()
                    }
                },
                {
                    provide: MailService,
                    useValue: {
                        sendWelcomeAndVerification: jest.fn()
                    }
                }
            ]
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        mailService = module.get<MailService>(MailService);
    });

    describe("all", () => {
        it("should return an array of users", () => {
            expect(userController.all()).toEqual(["users"]);
        });
    });

    describe("getUserTypes", () => {
        it("should return user types for admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "admin" } as User;
            const mockUsers = [
                { id: 1, role: "admin" },
                { id: 2, role: "company" },
                { id: 3, role: "client" }
            ] as User[];

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(userService, "all").mockResolvedValue(mockUsers);

            const result = await userController.getUserTypes(req);

            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "User types have been found",
                data: {
                    admin: 1,
                    company: 1,
                    user: 1,
                    deleted: 0,
                    totalActive: 3,
                    totalWithDeleted: 3
                }
            });
        });

        it("should return a 403 error for non-admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "client" } as User;

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);

            const result = await userController.getUserTypes(req);

            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to use this endpoint",
                data: null
            });
        });
    });

    describe("getBasicUsers", () => {
        it("should return basic users for admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "admin" } as User;
            const mockUsers = [
                { id: 1, role: "client" },
                { id: 2, role: "company" }
            ] as User[];

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(userService, "all").mockResolvedValue(mockUsers);

            const result = await userController.getBasicUsers(req);

            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Basic users have been found",
                data: [{ id: 1, role: "client" }]
            });
        });

        it("should return a 403 error for non-admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "client" } as User;

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);

            const result = await userController.getBasicUsers(req);

            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to use this endpoint",
                data: null
            });
        });
    });

    describe("getCompanies", () => {
        it("should return companies for admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "admin" } as User;
            const mockUsers = [
                { id: 1, role: "company" },
                { id: 2, role: "client" }
            ] as User[];

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(userService, "all").mockResolvedValue(mockUsers);

            const result = await userController.getCompanies(req);

            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Companies have been found",
                data: [{ id: 1, role: "company" }]
            });
        });

        it("should return a 403 error for non-admin users", async () => {
            const req = {
                cookies: { jwt: "token" }
            } as Request;
            const mockUser = { id: 1, role: "client" } as User;

            jest.spyOn(jwtService, "verify").mockReturnValue({ id: 1 });
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);

            const result = await userController.getCompanies(req);

            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to use this endpoint",
                data: null
            });
        });
    });
});
