import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { CompanyController } from "./company.controller";

describe("CompanyController", () => {
    let companyController: CompanyController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompanyController],
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn()
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

        companyController = module.get<CompanyController>(CompanyController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(companyController).toBeDefined();
    });

    describe("generateToken", () => {
        it("should generate a unique token", async () => {
            const user: User = {
                id: 1,
                first_name: "John",
                last_name: "Doe",
                role: "company"
            } as User;

            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);

            const token = await companyController.generateToken(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });

        it("should throw an error if max iteration is reached", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue({} as User);

            const user = {} as User;
            await expect(companyController.generateToken(user)).rejects.toThrowError(
                "Max iteration reached"
            );
        });
    });

    describe("requestToken", () => {
        it("should generate an API key for a company user", async () => {
            const companyUser: User = {
                id: 1,
                first_name: "John",
                last_name: "Doe",
                role: "company"
            } as User;

            const req = {
                cookies: { jwt: "validToken" }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(companyUser)
                .mockResolvedValueOnce(null);

            const result = await companyController.requestToken(req, companyUser, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject(expect.objectContaining({
                status: "OK",
                code: 200
            }));
        });

        it("should return 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await companyController.requestToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if user is not a company", async () => {
            const req = { cookies: { jwt: "validToken" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const result = await companyController.requestToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return error 500 if server error", async () => {
            const req = { cookies: { jwt: "validToken" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const user: User = new User;
            user.id = 1;
            user.role = "company";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            jest.spyOn(companyController, "generateToken").mockImplementationOnce(() => {
                throw new Error();
            });
            const result = await companyController.requestToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 500,
                data: null
            }));
        });
    });


    describe("resetToken", () => {
        it("should reset an API key for a company by an admin", async () => {
            const adminUser: User = {
                id: 1,
                role: "admin"
            } as User;
            const companyToReset: User = {
                id: 2,
                role: "company"
            } as User;

            const req = {
                cookies: { jwt: "validToken" },
                query: { id: "2" }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;

            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(companyToReset)
                .mockResolvedValueOnce(null);

            const result = await companyController.resetToken(
                req,
                adminUser,
                res
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject(expect.objectContaining({
                status: "OK",
                code: 200,
            }));
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await companyController.resetToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if user is not an admin", async () => {
            const req = { cookies: { jwt: "validToken" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const result = await companyController.resetToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return error 500 if server error", async () => {
            const req = {
                cookies: { jwt: "validToken" },
                query: { id: "2" }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(user);
            jest.spyOn(companyController, "generateToken").mockImplementationOnce(() => {
                throw new Error();
            });
            const result = await companyController.resetToken(req, {} as User, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 500,
                description: "Internal error",
                data: null
            }));
        });
    });
});
