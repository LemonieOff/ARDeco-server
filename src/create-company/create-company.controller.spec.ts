import { Test, TestingModule } from "@nestjs/testing";
import { CreateCompanyController } from "./create-company.controller";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("CreateCompanyController", () => {
    let createCompanyController: CreateCompanyController;
    let userService: UserService;

    const req = { cookies: { jwt: "token" } } as any;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CreateCompanyController],
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            delete: jest.fn().mockReturnValue({
                                from: jest.fn().mockReturnValue({
                                    where: jest.fn().mockReturnValue({
                                        execute: jest.fn()
                                    })
                                })
                            })
                        })
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

        createCompanyController = module.get<CreateCompanyController>(CreateCompanyController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(createCompanyController).toBeDefined();
    });

    describe("toCompany", () => {
        it("should return 401 if not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await createCompanyController.toCompany(req, 1, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return 403 if not admin", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce({
                id: 1,
                role: "client"
            } as any);
            const result = await createCompanyController.toCompany(req, 1, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return 404 if user not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce({
                id: 1,
                role: "admin"
            } as any)
                .mockResolvedValueOnce(null);
            const result = await createCompanyController.toCompany(req, 1, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 404,
                data: null
            }));
        });

        it("should return 400 if user is not a client", async () => {
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce({
                    id: 1,
                    role: "admin"
                } as any)
                .mockResolvedValueOnce({
                    id: 2,
                    role: "company"
                } as any);
            const result = await createCompanyController.toCompany(req, 2, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should update user to company and return 200", async () => {
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce({
                    id: 1,
                    role: "admin"
                } as any)
                .mockResolvedValueOnce({
                    id: 2,
                    role: "client"
                } as any);
            jest.spyOn(userService, "update").mockResolvedValue({
                id: 2,
                role: "company"
            } as any);
            const result = await createCompanyController.toCompany(req, 2, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject(expect.objectContaining({
                status: "OK",
                code: 200,
                data: {
                    id: 2,
                    role: "company"
                }
            }));
        });

        it("should return 501 if an error occurs during update", async () => {
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce({
                    id: 1,
                    role: "admin"
                } as any)
                .mockResolvedValueOnce({
                    id: 2,
                    role: "client"
                } as any);
            jest.spyOn(userService, "update").mockRejectedValue(new Error());
            const result = await createCompanyController.toCompany(req, 2, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 501,
                data: null
            }));
        });
    });
});
