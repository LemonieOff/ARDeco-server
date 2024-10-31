import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./models/user.entity";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";

describe("UserController", () => {
    let userController: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
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

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(userController).toBeDefined();
    });

    describe("all", () => {
        it("should return an array of strings", () => {
            expect(userController.all()).toEqual(["users"]);
        });
    });

    describe("whoami", () => {
        it("should return the current user", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            expect(await userController.whoami(req)).toEqual(user);
        });
    });

    describe("getOne", () => {
        it("should return a user by id", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const result = await userController.getOne({} as any, {} as any, 1);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeDefined();
            expect(result.data.id).toEqual(user.id);
            expect(result.data.firstname).toEqual(user.first_name);
            expect(result.data.lastname).toEqual(user.last_name);
            expect(result.data.email).toEqual(user.email);
        });

        it("should return 404 error if user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await userController.getOne({} as any, {} as any, 1);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(404);
        });
    });

    describe("editViaQuery", () => {
        it("should update a user", async () => {
            const oldUser: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(oldUser);
            jest.spyOn(userService, "update").mockResolvedValue({ affected: 1 } as any);
            const req = {
                cookies: { jwt: "token" },
                query: { id: 1 }
            } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editViaQuery(req, {
                email: "new-email@example.com"
            }, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data.affected).toEqual(1);
        });

        it("should return 400 error if user id is not part of query", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = {
                cookies: { jwt: "token" },
                query: { id: "NaN" }
            } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editViaQuery(req, {
                email: "new-email@example.com"
            }, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.error).toBeDefined();
        });
    });

    describe("editViaParam", () => {
        it("should update a user", async () => {
            const oldUser: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(oldUser);
            jest.spyOn(userService, "update").mockResolvedValue({ affected: 1 } as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editViaParam(req, 1, {
                email: "new-email@example.com"
            }, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data.affected).toEqual(1);
        });
    });

    describe("editUser", () => {
        it("should return error 401 when updating another user without being admin", async () => {
            const oldUser: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 40,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(oldUser);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editUser(req, 40, {
                email: "new-email@example.com"
            }, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 401 when updating self role without being admin", async () => {
            const oldUser: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(oldUser);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editUser(req, 1, {
                role: "company"
            }, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should update when editing self password", async () => {
            const oldUser: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                galleryComments: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false
            };
            jest.spyOn(userService, "findOne").mockResolvedValue(oldUser);
            jest.spyOn(userService, "update").mockResolvedValue({ affected: 1 } as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editUser(req, 1, {
                password: "newPassword"
            }, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeDefined();
            expect(result.data.affected).toEqual(1);
        });

        it("should return error 400 on error", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = {} as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.editUser(req, 1, {
                firstname: "newFirstName"
            } as any, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("getUserTypes", () => {
        it("should return an array of users types", async () => {
            const user: User = { role: "admin" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            jest.spyOn(userService, "all").mockResolvedValue([
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: true,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "company"
                } as any,
                {
                    deleted: false,
                    role: "client"
                } as any,
                {
                    deleted: true,
                    role: "client"
                } as any
            ]); // 2 deleted, 3 admin, 1 company, 2 client
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getUserTypes(req);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data.admin).toEqual(3);
            expect(result.data.company).toEqual(1);
            expect(result.data.user).toEqual(2);
            expect(result.data.deleted).toEqual(2);
            expect(result.data.totalActive).toEqual(4);
            expect(result.data.totalWithDeleted).toEqual(6);
        });

        it("should return error 403 if user is not an admin", async () => {
            const user: User = { role: "client" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getUserTypes(req);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 400 on error", async () => {
            const result = await userController.getUserTypes({} as any);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("getBasicUsers", () => {
        it("should return an array of users types", async () => {
            const user: User = { role: "admin" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            jest.spyOn(userService, "all").mockResolvedValue([
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: true,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "company"
                } as any,
                {
                    deleted: false,
                    role: "client"
                } as any,
                {
                    deleted: true,
                    role: "client"
                } as any
            ]); // 2 deleted, 3 admin, 1 company, 2 client
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getBasicUsers(req);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data.length).toEqual(2);
        });

        it("should return error 403 if user is not an admin", async () => {
            const user: User = { role: "client" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getBasicUsers(req);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 400 on error", async () => {
            const result = await userController.getBasicUsers({} as any);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("getCompanies", () => {
        it("should return an array of users types", async () => {
            const user: User = { role: "admin" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            jest.spyOn(userService, "all").mockResolvedValue([
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "admin"
                } as any,
                {
                    deleted: true,
                    role: "admin"
                } as any,
                {
                    deleted: false,
                    role: "company"
                } as any,
                {
                    deleted: false,
                    role: "client"
                } as any,
                {
                    deleted: true,
                    role: "client"
                } as any
            ]); // 2 deleted, 3 admin, 1 company, 2 client
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getCompanies(req);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data.length).toEqual(1);
        });

        it("should return error 403 if user is not an admin", async () => {
            const user: User = { role: "client" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const result = await userController.getCompanies(req);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 400 on error", async () => {
            const result = await userController.getCompanies({} as any);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("closeCompanies", () => {
        it("should return 200 on deletion", async () => {
            const admin: User = { role: "admin" } as any;
            const company: User = { role: "company" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(admin).mockResolvedValueOnce(company);
            jest.spyOn(userService, "update").mockResolvedValue({ affected: 1 } as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.closeCompany(req, 4, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeNull();
        });

        it("should return error 401 if user is not an admin", async () => {
            const admin: User = { role: "client" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(admin);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.closeCompany(req, 4, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 403 if retrieved user is not a company", async () => {
            const admin: User = { role: "admin" } as any;
            const company: User = { role: "client" } as any;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(admin).mockResolvedValueOnce(company);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.closeCompany(req, 4, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 500 on error", async () => {
            const res = { status: jest.fn().mockReturnThis() } as any;
            const result = await userController.closeCompany({} as any, 4, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(500);
            expect(result.data).toBeNull();
        });
    });
});

